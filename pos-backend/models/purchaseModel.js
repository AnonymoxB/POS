const mongoose = require("mongoose");

const purchaseSchema = new mongoose.Schema(
  {
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      required: true,
    },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        quantity: { type: Number, required: true },
        unit: { type: mongoose.Schema.Types.ObjectId, ref: "Unit", required: true },
        price: { type: Number, required: true },
        total: { type: Number, required: true },
        qtyBase: { type: Number },
      },
    ],
    grandTotal: {
      type: Number,
      required: true,
    },
    purchaseDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Purchase", purchaseSchema);
