const Payment = require("../models/paymentModel");

const getAllPayments = async (req, res, next) => {
  try {
    const payments = await Payment.find()
      .sort({ createdAt: -1 })
      .populate("sourceId")
      .populate("createdBy", "name email");

    res.status(200).json({ success: true, data: payments });
  } catch (error) {
    next(error);
  }
};



const createPayment = async (req, res, next) => {
  try {
    const { sourceType, sourceId, method, status, amount, note } = req.body;

    // arah otomatis
    let direction = "out";
    if (sourceType === "order" || sourceType === "sale") {
      direction = "in";
    }

    const newPayment = new Payment({
      paymentId: `${sourceType?.toUpperCase() || "PAY"}-${Date.now()}`,
      sourceType: sourceType?.toLowerCase(), // biar konsisten di DB
      sourceId,
      method: (method || "cash").toLowerCase(),
      status: (status || "success").toLowerCase(),
      amount: Number(amount) || 0,
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

// impan payment order
const savePaymentFromOrder = async (order, userId) => {
  const payment = new Payment({
    paymentId: `ORD-${Date.now()}`,
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
};

// impan payment purchase
const savePaymentFromPurchase = async (purchase, userId) => {
  const payment = new Payment({
    paymentId: `PUR-${Date.now()}`,
    sourceType: "purchase",
    sourceId: purchase._id,
    method: (purchase.paymentMethod || "cash").toLowerCase(),
    status: "success",
    amount: purchase.total || 0,
    note: `Payment for purchase ${purchase._id}`,
    direction: "out",
    createdBy: userId || null,
  });

  await payment.save();
  return payment;
};

//simpan payment expense
const savePaymentFromExpense = async (expense, userId) => {
  const payment = new Payment({
    paymentId: `EXP-${Date.now()}`,
    sourceType: "expense",
    sourceId: expense._id,
    method: (expense.paymentMethod || "cash").toLowerCase(),
    status: "success",
    amount: expense.total || 0,
    note: `Payment for expense ${expense._id}`,
    direction: "out",
    createdBy: userId || null,
  });

  await payment.save();
  return payment;
};



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
              $cond: [{ $eq: ["$_id.direction", "in"] }, "$totalAmount", 0],
            },
          },
          out: {
            $sum: {
              $cond: [{ $eq: ["$_id.direction", "out"] }, "$totalAmount", 0],
            },
          },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ];

    const summary = await Payment.aggregate(pipeline);

    // biar frontend gampang
    const formatted = summary.map((s) => ({
      year: s._id.year,
      month: s._id.month,
      in: s.in,
      out: s.out,
      net: s.in - s.out, // saldo bersih bulan itu
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
  getPaymentsSummary,
  savePaymentFromPurchase,
  savePaymentFromExpense,
};
