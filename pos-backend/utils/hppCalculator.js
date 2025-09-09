const DishBOM = require("../models/dishBOMModel");
const { convertQty } = require("./unitConverter");
const Product = require("../models/productModel");

async function hitungHppDish(dishId, qty = 1, variant = "") {
  const bomList = await DishBOM.find({ dish: dishId, variant })
    .populate({ path: "product", populate: "defaultUnit" })
    .populate("unit");

  let totalHpp = 0;

  for (const bom of bomList) {
    const product = bom.product;
    if (!product || !product.defaultUnit) continue;

    // qty bom × order qty
    const totalBomQty = bom.qty * qty;

    // konversi ke base unit produk
    const qtyBase = await convertQty(
      totalBomQty,
      bom.unit._id,
      product.defaultUnit._id,
      product
    );

    // hitung HPP (harga pokok produksi)
    const hppPerUnit = product.hppPerBase || 0; // harga pokok per unit dasar
    totalHpp += hppPerUnit * qtyBase;
  }

  return totalHpp;
}

module.exports = { hitungHppDish };
