const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    paymentId: { type: String, required: true, unique: true },

    sourceType: {
      type: String,
      enum: ["Purchase", "Order", "Expense"],
      required: true,
    },
    sourceId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "sourceType",
    },

    method: {
      type: String,
      enum: ["Cash", "Transfer", "Qris", "Other"],
      default: "Cash",
    },
    status: {
      type: String,
      enum: ["Success", "Pending", "Failed"],
      default: "Success",
    },
    direction: {
      type: String,
      enum: ["In", "Out"],
      required: true,
    },
    amount: { type: Number, required: true, min: 0 },
    note: String,

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);
