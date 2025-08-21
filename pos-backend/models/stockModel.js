const mongoose = require("mongoose");
const { Schema } = mongoose;

const stockTransactionSchema = new Schema(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    type: {
      type: String,
      enum: ["IN", "OUT"], 
      required: true,
    },
    qty: {
      type: Number,
      required: true,
    },
    unit: {
      type: Schema.Types.ObjectId,
      ref: "Unit",
      required: true,
    },
    note: {
      type: String, // keterangan tambahan
    },
    relatedOrder: {
      type: Schema.Types.ObjectId,
      ref: "Order", // keluar stok karena order dish
      default: null,
    },
    relatedDish: {
      type: Schema.Types.ObjectId,
      ref: "Dish", // keluar stok karena BOM dish
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("StockTransaction", stockTransactionSchema);
