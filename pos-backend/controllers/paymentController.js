const Payment = require("../models/paymentModel");
const getNextSequence = require("../utils/getNextSequence");

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

//CREATE payment
const createPayment = async (req, res, next) => {
  try {
    let { sourceType, sourceId, method, status, amount, note } = req.body;

    // Normalisasi sourceType
    if (sourceType) {
      sourceType =
        sourceType.charAt(0).toUpperCase() + sourceType.slice(1).toLowerCase();
    }

    // Prefix per tipe
    const prefixMap = {
      Order: "ORD",
      Purchase: "PUR",
      Expense: "EXP",
    };
    const prefix = prefixMap[sourceType] || "PAY";

    // Arah otomatis
    const directionMap = {
      Order: "In",
      Purchase: "Out",
      Expense: "Out",
    };
    const direction = directionMap[sourceType] || "In";

    // Ambil nomor urut khusus untuk tipe ini
    const seq = await getNextSequence(sourceType || "Payment");
    const paddedSeq = String(seq).padStart(4, "0"); // 0001, 0002, dst

    const newPayment = new Payment({
      paymentId: `${prefix}-${paddedSeq}`,
      sourceType,
      sourceId,
      method: method || "Cash",
      status: status || "Success",
      amount: Number(amount) || 0,
      note,
      direction,
      createdBy: req.user?._id || null,
    });

    await newPayment.save();
    res.status(201).json({ success: true, data: newPayment });
  } catch (error) {
    console.error("❌ Error in createPayment:", error.message);
    next(error);
  }
};


//  GET detail payment
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

//  UPDATE payment
const updatePayment = async (req, res, next) => {
  try {
    const updated = await Payment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

//  DELETE payment
const deletePayment = async (req, res, next) => {
  try {
    await Payment.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Payment berhasil dihapus" });
  } catch (error) {
    next(error);
  }
};

const getNextSequence = require("../utils/getNextSequence");
const Payment = require("../models/paymentModel");

//simpan payment dari Order
const savePaymentFromOrder = async (order, userId) => {
  const seq = await getNextSequence("Order");   
  const paddedSeq = String(seq).padStart(4, "0"); 

  const payment = new Payment({
    paymentId: `ORD-${paddedSeq}`,
    sourceType: "Order",
    sourceId: order._id,
    method: order.paymentMethod || "Cash",
    status: "Success",
    amount: order.bills?.totalWithTax || order.total || 0,
    note: `Payment from order ${order._id}`,
    direction: "In",
    createdBy: userId ? new mongoose.Types.ObjectId(userId) : null,
  });

  await payment.save();
  return payment;
};


// simpan payment dari Purchase
const savePaymentFromPurchase = async (purchase, userId) => {
  const seq = await getNextSequence("Purchase");
  const paddedSeq = String(seq).padStart(4, "0");

  const payment = new Payment({
    paymentId: `PUR-${paddedSeq}`,
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

// simpan payment dari Expense
const savePaymentFromExpense = async (expense, userId) => {
  const seq = await getNextSequence("Expense");
  const paddedSeq = String(seq).padStart(4, "0");

  const payment = new Payment({
    paymentId: `EXP-${paddedSeq}`,
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


//  GET summary
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
