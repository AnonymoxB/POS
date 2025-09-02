const Dish = require("../models/dishModel");
const DishBOM = require("../models/dishBOMModel");
const Product = require("../models/productModel");

async function updateDishHPP(productId, session) {
  // Cari semua BOM yang pakai product ini
  const boms = await DishBOM.find({ product: productId }).session(session);
  if (!boms.length) return;

  // Grouping by dishId + variant
  const dishMap = {};
  for (const bom of boms) {
    const key = `${bom.dish}_${bom.variant}`;
    if (!dishMap[key]) dishMap[key] = { dishId: bom.dish, variant: bom.variant, items: [] };
    dishMap[key].items.push(bom);
  }

  // Hitung HPP per dish + variant
  for (const { dishId, variant, items } of Object.values(dishMap)) {
    let totalHPP = 0;

    for (const bom of items) {
      const product = await Product.findById(bom.product).session(session);
      if (!product) continue;

      totalHPP += bom.qty * (product.price || 0);
    }

    // Update ke field yang sesuai
    const updateField =
      variant === "hot" ? { "hpp.hpphot": totalHPP } : { "hpp.hppice": totalHPP };

    await Dish.findByIdAndUpdate(dishId, { $set: updateField }, { session });
  }
}

module.exports = { updateDishHPP };
