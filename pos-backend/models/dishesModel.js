const mongoose = require("mongoose");

const dishSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    price: {
      hot: {
      type: Number,
      required: true,
      },
      ice: {
        type: Number,
        required: true,
    }},
    hpp: {
      hpphot: { type: Number, required: true },
      hppice: { type: Number, required: true }
    },
    category: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Dish", dishSchema);
