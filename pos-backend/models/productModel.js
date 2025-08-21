const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    defaultUnit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Unit", // unit utama
    },
    stockBase: {
      type: Number,
      default: 0, // stok disimpan dalam unit dasar
    },
    stockDisplay: {
      type: String,
      default: "0", // contoh: "5 Kg"
    },
    price: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
