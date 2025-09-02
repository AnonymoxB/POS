const mongoose = require("mongoose");

const dishBOMSchema = new mongoose.Schema(
  {
    dish: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Dish",
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    qty: {
      type: Number,
      required: true,
    },
    unit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Unit",
      required: true,
    },
    variant: {
      type: String,
      enum: ["hot", "ice"],
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("DishBOM", dishBOMSchema);
