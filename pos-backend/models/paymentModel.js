const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  paymentId: String,
  orderId: String,
  method: String,
  status: String,
  amount: Number,
}, { timestamps: true });

module.exports = mongoose.model("Payment", paymentSchema);
