const Payment = require("../models/paymentModel");

// ✅ GET: Ambil semua data payment
const getAllPayments = async (req, res, next) => {
  try {
    const payments = await Payment.find().sort({ createdAt: -1 }).populate("orderId");
    res.status(200).json({ data: payments });
  } catch (error) {
    next(error);
  }
};

// ✅ POST: Simpan pembayaran cash manual
const createCashPayment = async (req, res, next) => {
  try {
    const { orderId, amount, contact, email } = req.body;

    const newPayment = new Payment({
      paymentId: "CASH-" + Date.now(),
      orderId,
      amount,
      currency: "IDR",
      status: "captured",
      method: "cash",
      email: email || "",
      contact: contact || "",
    });

    await newPayment.save();

    res.status(200).json({ success: true, message: "Cash payment recorded." });
  } catch (error) {
    next(error);
  }
};

// ✅ Internal use: Simpan otomatis saat order dibuat
const savePaymentFromOrder = async (order, reqBody) => {
  try {
    const paymentMethod = reqBody.paymentMethod || "unknown";
    const amount = reqBody.bills?.totalWithTax || 0;

    if (paymentMethod && amount > 0) {
      const payment = new Payment({
        paymentId: `PAY-${Date.now()}`,
        orderId: order._id,
        method: paymentMethod,
        status: "success",
        amount,
      });

      await payment.save();
    }
  } catch (error) {
    console.error("❌ Failed to save payment from order:", error);
    throw error;
  }
};


module.exports = {
  getAllPayments,
  createCashPayment,
  savePaymentFromOrder,
};
