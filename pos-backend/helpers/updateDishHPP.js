const Dish = require("../models/dishesModel");
const DishBOM = require("../models/dishBOMModel");
const Product = require("../models/productModel");
const Unit = require("../models/unitModel");

/**
 * Rekursif cari base unit dan quantity sesuai konversi
 * @param {ObjectId} unitId
 * @param {number} qty
 * @param {mongoose.ClientSession} session
 */
async function getBaseUnitAndQty(unitId, qty, session) {
  const unitDoc = await Unit.findById(unitId).session(session);
  if (!unitDoc) return { unitBase: unitId, qtyBase: qty };

  if (!unitDoc.baseUnit) {
    return {
      unitBase: unitDoc._id,
      qtyBase: qty * (unitDoc.conversion || 1),
    };
  }

  return await getBaseUnitAndQty(
    unitDoc.baseUnit,
    qty * (unitDoc.conversion || 1),
    session
  );
}

/**
 * Update HPP dish berdasarkan product tertentu
 * @param {ObjectId} productId
 * @param {mongoose.ClientSession} session
 */
async function updateDishHPP(productId, session) {
  // Cari semua BOM yang pakai product ini
  const boms = await DishBOM.find({ product: productId }).session(session);
  if (!boms.length) return;

  // Ambil semua product yang dipakai di BOM
  const productIds = [...new Set(boms.map(b => b.product.toString()))];
  const products = await Product.find({ _id: { $in: productIds } }).session(session);
  const productMap = Object.fromEntries(products.map(p => [p._id.toString(), p]));

  // Group BOM per dish + variant
  const dishMap = {};
  for (const bom of boms) {
    const key = `${bom.dish}_${bom.variant || "default"}`;
    if (!dishMap[key]) dishMap[key] = { dishId: bom.dish, variant: bom.variant || "default", items: [] };
    dishMap[key].items.push(bom);
  }

  // Hitung HPP tiap dish + variant
  const dishUpdates = {};
  for (const { dishId, variant, items } of Object.values(dishMap)) {
    let totalHPP = 0;

    for (const bom of items) {
      const product = productMap[bom.product.toString()];
      if (!product) continue;

      // Konversi qty BOM ke base unit
      const { qtyBase } = await getBaseUnitAndQty(bom.unit, bom.qty, session);
      totalHPP += qtyBase * (product.hpp || 0);
    }

    if (!dishUpdates[dishId]) dishUpdates[dishId] = {};
    if (variant === "hot") dishUpdates[dishId].hpphot = totalHPP;
    else if (variant === "ice") dishUpdates[dishId].hppice = totalHPP;
    else {
      dishUpdates[dishId].hpphot = totalHPP;
      dishUpdates[dishId].hppice = totalHPP;
    }
  }

  // Update semua dish
  const updatePromises = Object.entries(dishUpdates).map(([dishId, hpp]) =>
    Dish.findByIdAndUpdate(
      dishId,
      { $set: { "hpp.hpphot": hpp.hpphot, "hpp.hppice": hpp.hppice } },
      { session }
    )
  );

  await Promise.all(updatePromises);
}

module.exports = { updateDishHPP };
