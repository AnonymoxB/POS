const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    paymentId: { type: String, required: true, unique: true },
    sourceType: {
      type: String,
      enum: ["order", "purchase", "expense"],
      required: true,
    }, // asal transaksi
    sourceId: { type: mongoose.Schema.Types.ObjectId, refPath: "sourceType" },

    method: { type: String, enum: ["cash", "transfer", "qris", "other"], default: "cash" },
    status: { type: String, enum: ["pending", "success", "failed"], default: "success" },

    amount: { type: Number, required: true },
    direction: { type: String, enum: ["in", "out"], required: true },

    note: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);
