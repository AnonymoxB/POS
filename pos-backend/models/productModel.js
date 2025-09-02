const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductCategory",
    },
    defaultUnit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Unit",
    },
    stockBase: {
      type: Number,
      default: 0, // stok dalam base unit
    },
    stockDisplay: {
      type: String,
      default: "0", // stok dalam format user-friendly (misalnya "5 kg")
    },
    price: {
      type: Number,
      required: true, // harga jual
    },
    hpp: {
      type: Number,
      default: 0, // harga pokok rata-rata
    },
    lastPurchasePrice: {
      type: Number,
      default: 0, // harga beli terakhir
    },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
