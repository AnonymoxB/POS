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
        default:0,
      },
      ice: {
        type: Number,
        default:0,
    }},
    hpp: {
      hpphot: { type: Number, default:0 },
      hppice: { type: Number, default:0 }
    },
    category: {
      type: "Category",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Dish", dishSchema);
