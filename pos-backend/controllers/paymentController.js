const Payment = require("../models/paymentModel");

// ✅ GET semua payment
const getAllPayments = async (req, res, next) => {
  try {
    const payments = await Payment.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: payments });
  } catch (error) {
    next(error);
  }
};

// ✅ POST manual (bisa cash masuk/keluar)
const createPayment = async (req, res, next) => {
  try {
    const { sourceType, sourceId, method, status, amount, note } = req.body;

    let direction = "out";
    if (sourceType === "order") direction = "in";

    const newPayment = new Payment({
      paymentId: `${sourceType.toUpperCase()}-${Date.now()}`,
      sourceType,
      sourceId,
      method: (method || "cash").toLowerCase(),
      status: (status || "success").toLowerCase(),
      amount,
      note,
      direction,
      createdBy: req.user?._id,
    });

    await newPayment.save();
    res.status(201).json({ success: true, data: newPayment });
  } catch (error) {
    next(error);
  }
};


// ✅ GET detail payment
const getPaymentById = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment tidak ditemukan" });
    }
    res.status(200).json({ success: true, data: payment });
  } catch (error) {
    next(error);
  }
};

// ✅ PUT update
const updatePayment = async (req, res, next) => {
  try {
    const updated = await Payment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

// ✅ DELETE
const deletePayment = async (req, res, next) => {
  try {
    await Payment.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Payment berhasil dihapus" });
  } catch (error) {
    next(error);
  }
};


const savePaymentFromOrder = async (order, userId) => {
  try {
    const payment = new Payment({
      paymentId: `PAY-${Date.now()}`,
      sourceType: "order",                 
      sourceId: order._id,                 
      method: (order.paymentMethod || "cash").toLowerCase(), 
      status: "success",
      amount: order.bills?.totalWithTax || order.total || 0, 
      note: `Payment from order ${order._id}`,
      direction: "in",                  
      createdBy: userId || null,
    });

    await payment.save();
    return payment;
  } catch (error) {
    console.error("❌ Failed to save payment from order:", error);
    throw error;
  }
};


const getPaymentsSummary = async (req, res, next) => {
  try {
    const pipeline = [
      {
        $group: {
          _id: { direction: "$direction", month: { $month: "$createdAt" } },
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.month": 1 },
      },
    ];

    const summary = await Payment.aggregate(pipeline);

    res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    next(error);
  }
};


module.exports = {
  getAllPayments,
  createPayment,
  getPaymentById,
  updatePayment,
  deletePayment,
  savePaymentFromOrder,
  getPaymentsSummary
};
