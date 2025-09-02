const Dish = require("../models/dishesModel");
const DishBOM = require("../models/dishBOMModel");
const Product = require("../models/productModel");

/**
 * Update HPP semua dish yang pakai product tertentu
 * @param {ObjectId} productId - id product yang berubah HPP
 * @param {mongoose.ClientSession} session - mongoose session (opsional)
 */
async function updateDishHPP(productId, session) {
  // Cari semua BOM yang pakai product ini
  const boms = await DishBOM.find({ product: productId }).session(session);
  if (!boms.length) return;

  // Grouping dish berdasarkan dishId + variant
  const dishMap = {};
  for (const bom of boms) {
    const key = `${bom.dish}_${bom.variant || "default"}`;
    if (!dishMap[key]) {
      dishMap[key] = { dishId: bom.dish, variant: bom.variant || "default", items: [] };
    }
    dishMap[key].items.push(bom);
  }

  // Hitung ulang HPP per dish
  for (const { dishId, variant, items } of Object.values(dishMap)) {
    let totalHPP = 0;

    for (const bom of items) {
      const product = await Product.findById(bom.product).session(session);
      if (!product) continue;

      // Ambil HPP terbaru dari product
      totalHPP += bom.qty * (product.hpp || 0);
    }

    // Update ke field HPP dish sesuai variant
    const updateField =
      variant === "hot"
        ? { "hpp.hpphot": totalHPP }
        : variant === "ice"
        ? { "hpp.hppice": totalHPP }
        : {
            "hpp.hpphot": totalHPP,
            "hpp.hppice": totalHPP, // default → isi dua-duanya sama
          };

    await Dish.findByIdAndUpdate(dishId, { $set: updateField }, { session });
  }
}

module.exports = { updateDishHPP };
