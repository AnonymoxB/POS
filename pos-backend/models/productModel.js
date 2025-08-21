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
      default: 0,
    },
    stockDisplay: {
      type: String,
      default: "0",
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
