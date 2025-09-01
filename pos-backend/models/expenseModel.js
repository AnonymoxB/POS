const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
    date: { type: Date, default: Date.now },
    category: { type: String, required: true }, // contoh: listrik, transport, gaji
    amount: { type: Number, required: true },
    note: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Expense", expenseSchema);
