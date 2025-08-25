const Payment = require("../models/paymentModel");

// ✅ GET all payments
const getAllPayments = async (req, res, next) => {
  try {
    const payments = await Payment.find()
      .sort({ createdAt: -1 })
      .populate("sourceId")
      .populate("createdBy", "name email");

    res.status(200).json({ success: true, data: payments });
  } catch (error) {
    console.error("❌ Error in getAllPayments:", error.message);
    next(error);
  }
};

// ✅ CREATE payment
const createPayment = async (req, res, next) => {
  try {
    const { sourceType, sourceId, method, status, amount, note } = req.body;

    // arah otomatis
    let direction = "In";
    if (sourceType === "Purchase" || sourceType === "Expense") {
      direction = "Out";
    }

    const newPayment = new Payment({
      paymentId: `${sourceType?.toUpperCase() || "PAY"}-${Date.now()}`,
      sourceType,                               // enum: Purchase | Order | Expense
      sourceId,
      method: method || "Cash",                 // enum: Cash | Transfer | Qris | Other
      status: status || "Success",              // enum: Success | Pending | Failed
      amount: Number(amount) || 0,
      note,
      direction,                                // enum: In | Out
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

// ✅ UPDATE payment
const updatePayment = async (req, res, next) => {
  try {
    const updated = await Payment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

// ✅ DELETE payment
const deletePayment = async (req, res, next) => {
  try {
    await Payment.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Payment berhasil dihapus" });
  } catch (error) {
    next(error);
  }
};

// ✅ simpan payment dari Order
const savePaymentFromOrder = async (order, userId) => {
  const payment = new Payment({
    paymentId: `ORD-${Date.now()}`,
    sourceType: "Order",
    sourceId: order._id,
    method: order.paymentMethod || "Cash",
    status: "Success",
    amount: order.bills?.totalWithTax || order.total || 0,
    note: `Payment from order ${order._id}`,
    direction: "In",
    createdBy: userId || null,
  });

  await payment.save();
  return payment;
};

// ✅ simpan payment dari Purchase
const savePaymentFromPurchase = async (purchase, userId) => {
  const payment = new Payment({
    paymentId: `PUR-${Date.now()}`,
    sourceType: "Purchase",
    sourceId: purchase._id,
    method: purchase.paymentMethod || "Cash",
    status: "Success",
    amount: purchase.total || 0,
    note: `Payment for purchase ${purchase._id}`,
    direction: "Out",
    createdBy: userId || null,
  });

  await payment.save();
  return payment;
};

// ✅ simpan payment dari Expense
const savePaymentFromExpense = async (expense, userId) => {
  const payment = new Payment({
    paymentId: `EXP-${Date.now()}`,
    sourceType: "Expense",
    sourceId: expense._id,
    method: expense.paymentMethod || "Cash",
    status: "Success",
    amount: expense.total || 0,
    note: `Payment for expense ${expense._id}`,
    direction: "Out",
    createdBy: userId || null,
  });

  await payment.save();
  return payment;
};

// ✅ GET summary
const getPaymentsSummary = async (req, res, next) => {
  try {
    const pipeline = [
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            direction: "$direction",
          },
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: { year: "$_id.year", month: "$_id.month" },
          in: {
            $sum: {
              $cond: [{ $eq: ["$_id.direction", "In"] }, "$totalAmount", 0],
            },
          },
          out: {
            $sum: {
              $cond: [{ $eq: ["$_id.direction", "Out"] }, "$totalAmount", 0],
            },
          },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ];

    const summary = await Payment.aggregate(pipeline);

    const formatted = summary.map((s) => ({
      year: s._id.year,
      month: s._id.month,
      in: s.in,
      out: s.out,
      net: s.in - s.out,
    }));

    res.status(200).json({ success: true, data: formatted });
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
  savePaymentFromPurchase,
  savePaymentFromExpense,
  getPaymentsSummary,
};
