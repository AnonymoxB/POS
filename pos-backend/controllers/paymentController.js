const Payment = require("../models/paymentModel");

// ✅ GET semua payment (cashflow)
const getAllPayments = async (req, res, next) => {
  try {
    const payments = await Payment.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: payments });
  } catch (error) {
    next(error);
  }
};


const createPayment = async (req, res, next) => {
  try {
    const { sourceType, sourceId, method, status, amount, note } = req.body;

    // ✅ Tentukan arah otomatis berdasarkan sourceType
    let direction = "out";
    if (sourceType === "order") direction = "in"; // order = pemasukan
    if (sourceType === "purchase" || sourceType === "expense") direction = "out"; // pembelian & pengeluaran = keluar

    const newPayment = new Payment({
      paymentId: `${sourceType.toUpperCase()}-${Date.now()}`,
      sourceType,
      sourceId,
      method,
      status,
      amount,
      note,
      direction, // ✅ sudah ditentukan otomatis
      createdBy: req.user?._id,
    });

    await newPayment.save();

    res.status(201).json({
      success: true,
      message: "Payment berhasil ditambahkan",
      data: newPayment,
    });
  } catch (error) {
    next(error);
  }
};

// ✅ GET: detail payment
const getPaymentById = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res
        .status(404)
        .json({ success: false, message: "Payment tidak ditemukan" });
    }
    res.status(200).json({ success: true, data: payment });
  } catch (error) {
    next(error);
  }
};

// ✅ PUT: update payment
const updatePayment = async (req, res, next) => {
  try {
    const updated = await Payment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

// ✅ DELETE: hapus payment
const deletePayment = async (req, res, next) => {
  try {
    await Payment.findByIdAndDelete(req.params.id);
    res
      .status(200)
      .json({ success: true, message: "Payment berhasil dihapus" });
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
};
