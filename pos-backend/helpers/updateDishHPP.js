const Dish = require("../models/dishModel");
const DishBOM = require("../models/dishBOMModel");
const Product = require("../models/productModel");

async function updateDishHPP(productId, session) {
  // cari semua BOM yang pakai product ini
  const boms = await DishBOM.find({ product: productId }).session(session);
  if (!boms.length) return;

  // grouping by dish
  const dishMap = {};
  for (const bom of boms) {
    if (!dishMap[bom.dish]) dishMap[bom.dish] = [];
    dishMap[bom.dish].push(bom);
  }

  for (const [dishId, dishBoms] of Object.entries(dishMap)) {
    let totalHPP = 0;

    for (const bom of dishBoms) {
      const product = await Product.findById(bom.product).session(session);
      if (!product) continue;

      // hitung hpp: qty * harga product terakhir
      totalHPP += bom.qty * (product.price || 0);
    }

    // update Dish HPP → sementara samakan ke hpphot & hppice
    await Dish.findByIdAndUpdate(
      dishId,
      {
        $set: {
          "hpp.hpphot": totalHPP,
          "hpp.hppice": totalHPP,
        },
      },
      { session }
    );
  }
}

module.exports = { updateDishHPP };
