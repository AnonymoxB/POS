const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    paymentId: { type: String, required: true, unique: true },

    // asal pembayaran
    sourceType: {
      type: String,
      enum: ["purchase", "order", "expense"],
      required: true,
    },
    sourceId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "sourceType",
    },

    // detail pembayaran
    method: {
      type: String,
      enum: ["cash", "transfer", "qris", "other"],
      default: "cash",
    },
    status: {
      type: String,
      enum: ["success", "pending", "failed"],
      default: "success",
    },
    direction: {
      type: String,
      enum: ["in", "out"], // masuk (penjualan), keluar (pembelian/expense)
      required: true,
    },
    amount: { type: Number, required: true, min: 0 },
    note: String,

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);
