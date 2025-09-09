// controllers/stockController.js
const mongoose = require("mongoose");
const StockTransaction = require("../models/stockModel");
const ExcelJS = require("exceljs");
const Product = require("../models/productModel");
const Unit = require("../models/unitModel");

/* ===========================
   CRUD TRANSAKSI
=========================== */

// Ambil semua transaksi stok
exports.getStockTransactions = async (req, res) => {
  try {
    const { type, product, startDate, endDate } = req.query;
    const filter = {};

    if (type) filter.type = type; // "IN" / "OUT"
    if (product) filter.product = product;
    if (startDate && endDate) {
      filter.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const transactions = await StockTransaction.find(filter)
      .populate("product", "name")
      .populate("unit", "name short")
      .populate("unitBase", "name short")
      .populate("relatedOrder", "orderNumber")
      .populate("relatedDish", "name")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: transactions });
  } catch (err) {
    console.error("🔥 getStockTransactions Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Buat transaksi stok manual / adjustment stok
exports.createStockTransaction = async (req, res) => {
  try {
    const { qty, unit: unitId, ...rest } = req.body;

    const unit = await Unit.findById(unitId);
    if (!unit) {
      return res.status(400).json({ success: false, message: "Invalid unit" });
    }

    let qtyBase = qty;
    let unitBase = unit._id;

    // Kalau unit turunan, convert ke baseUnit
    if (unit.baseUnit) {
      qtyBase = qty * unit.conversion;
      unitBase = unit.baseUnit;
    }

    const transaction = await StockTransaction.create({
      ...rest,
      qty,
      unit: unit._id,
      qtyBase,
      unitBase,
    });

    res.status(201).json({ success: true, data: transaction });
  } catch (err) {
    console.error("🔥 createStockTransaction Error:", err);
    res.status(400).json({ success: false, message: err.message });
  }
};

// Ambil detail transaksi stok
exports.getStockTransactionById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid transaction ID" });
    }

    const trx = await StockTransaction.findById(id)
      .populate("product", "name")
      .populate("unit", "name short");

    if (!trx) {
      return res.status(404).json({ success: false, message: "Not found" });
    }

    res.json({ success: true, data: trx });
  } catch (err) {
    console.error("🔥 getStockTransactionById Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Hapus transaksi stok
exports.deleteStockTransaction = async (req, res) => {
  try {
    const trx = await StockTransaction.findByIdAndDelete(req.params.id);
    if (!trx) {
      return res.status(404).json({ success: false, message: "Not found" });
    }
    res.json({ success: true, message: "Deleted successfully" });
  } catch (err) {
    console.error("🔥 deleteStockTransaction Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ===========================
   SUMMARY & HISTORY
=========================== */


// Summary stok per produk (semua produk + opening balance)
exports.getStockSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const match = {};
    if (startDate && endDate) {
      match.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    // Ambil semua produk + default unit
    const products = await Product.find()
      .populate("defaultUnit", "short conversion");

    const result = [];

    for (const product of products) {
      // Hitung saldo awal (sebelum periode)
      let openingMatch = { product: product._id };
      if (startDate) {
        openingMatch.createdAt = { $lt: new Date(startDate) };
      }

      const openingAgg = await StockTransaction.aggregate([
        { $match: openingMatch },
        {
          $group: {
            _id: "$product",
            totalIn: { $sum: { $cond: [{ $eq: ["$type", "IN"] }, "$qtyBase", 0] } },
            totalOut: { $sum: { $cond: [{ $eq: ["$type", "OUT"] }, "$qtyBase", 0] } },
          },
        },
      ]);

      const openingBalance = openingAgg.length
        ? openingAgg[0].totalIn - openingAgg[0].totalOut
        : 0;

      // Hitung transaksi dalam periode
      const trxAgg = await StockTransaction.aggregate([
        { $match: { ...match, product: product._id } },
        {
          $group: {
            _id: "$product",
            totalIn: { $sum: { $cond: [{ $eq: ["$type", "IN"] }, "$qtyBase", 0] } },
            totalOut: { $sum: { $cond: [{ $eq: ["$type", "OUT"] }, "$qtyBase", 0] } },
          },
        },
      ]);

      const totalIn = trxAgg.length ? trxAgg[0].totalIn : 0;
      const totalOut = trxAgg.length ? trxAgg[0].totalOut : 0;
      const closingBalance = openingBalance + totalIn - totalOut;

      result.push({
        productId: product._id,
        productName: product.name,
        openingBalance,
        totalIn,
        totalOut,
        closingBalance,
        unitShort: product.defaultUnit?.short || "-",
      });
    }

    res.json({ success: true, data: result });
  } catch (err) {
    console.error("🔥 getStockSummary Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};





// Summary stok per produk (by ID + filter tanggal)
exports.getStockSummaryByProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const { start, end } = req.query;

    const match = { product: new mongoose.Types.ObjectId(productId) };
    if (start && end) {
      match.createdAt = { $gte: new Date(start), $lte: new Date(end) };
    }

    const summary = await StockTransaction.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$type",
          totalQty: { $sum: "$qtyBase" },
        },
      },
    ]);

    const result = { IN: 0, OUT: 0 };
    summary.forEach((s) => {
      result[s._id] = s.totalQty;
    });

    // ambil info produk & unit
    const product = await Product.findById(productId)
      .populate("defaultUnit", "short conversion")
      .populate("baseUnit", "short");

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const balanceBase = result.IN - result.OUT;
    const balance =
      balanceBase / (product.defaultUnit?.conversion || 1);

    res.json({
      success: true,
      data: {
        product: { _id: product._id, name: product.name },
        totalIn: result.IN,
        totalOut: result.OUT,
        balance,
        balanceBase,
        unitShort: product.defaultUnit?.short,
        baseUnitShort: product.baseUnit?.short,
      },
    });
  } catch (err) {
    console.error("🔥 getStockSummaryByProduct Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};


// Riwayat transaksi stok per produk
exports.getStockHistoryByProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const { start, end } = req.query;

    const filter = { product: productId };
    if (start && end) {
      filter.createdAt = { $gte: new Date(start), $lte: new Date(end) };
    }

    const history = await StockTransaction.find(filter)
      .populate("product", "name")
      .populate("unit", "short")
      .sort({ createdAt: -1 });

    if (!history.length) {
      return res.status(404).json({
        success: false,
        message: "No stock history found for this product",
      });
    }

    res.json({ success: true, data: history });
  } catch (err) {
    console.error("🔥 getStockHistoryByProduct Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ===========================
   EXPORT EXCEL
=========================== */

// Export summary stok ke Excel
exports.exportStockSummary = async (req, res) => {
  try {
    const summary = await StockTransaction.aggregate([
      {
        $group: {
          _id: "$product",
          totalIn: { $sum: { $cond: [{ $eq: ["$type", "IN"] }, "$qtyBase", 0] } },
          totalOut: { $sum: { $cond: [{ $eq: ["$type", "OUT"] }, "$qtyBase", 0] } },
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      {
        $lookup: {
          from: "units",
          localField: "product.defaultUnit",
          foreignField: "_id",
          as: "defaultUnit",
        },
      },
      { $unwind: { path: "$defaultUnit", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "units",
          localField: "product.baseUnit",
          foreignField: "_id",
          as: "baseUnit",
        },
      },
      { $unwind: { path: "$baseUnit", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          productName: "$product.name",
          totalIn: 1,
          totalOut: 1,
          balanceBase: { $subtract: ["$totalIn", "$totalOut"] },
          balance: {
            $divide: [
              { $subtract: ["$totalIn", "$totalOut"] },
              { $ifNull: ["$defaultUnit.conversion", 1] },
            ],
          },
          unitShort: "$defaultUnit.short",
          baseUnitShort: "$baseUnit.short",
        },
      },
    ]);

    // Buat workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Stock Summary");

    // Header
    worksheet.columns = [
      { header: "Product", key: "productName", width: 30 },
      { header: "Total In (Base)", key: "totalIn", width: 20 },
      { header: "Total Out (Base)", key: "totalOut", width: 20 },
      { header: "Balance", key: "balance", width: 20 },
      { header: "Unit", key: "unitShort", width: 10 },
      { header: "Balance Base", key: "balanceBase", width: 20 },
      { header: "Base Unit", key: "baseUnitShort", width: 12 },
    ];

    // Isi data
    summary.forEach((item) => {
      worksheet.addRow({
        productName: item.productName,
        totalIn: item.totalIn,
        totalOut: item.totalOut,
        balance: item.balance,
        unitShort: item.unitShort,
        balanceBase: item.balanceBase,
        baseUnitShort: item.baseUnitShort,
      });
    });

    // Export file
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=stock_summary.xlsx"
    );
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error("🔥 exportStockSummary Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};


// ==================================
// Export Summary per Produk (Excel)
// ==================================
exports.exportStockSummaryByProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Produk tidak ditemukan" });
    }

    const stockData = await Stock.find({ product: productId }).populate("unit");

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Ringkasan Stok");

    // Header Excel
    worksheet.columns = [
      { header: "Tanggal", key: "tanggal", width: 25 },
      { header: "Tipe", key: "type", width: 10 },
      { header: "Qty", key: "qty", width: 10 },
      { header: "Unit", key: "unit", width: 15 },
      { header: "Note", key: "note", width: 40 },
    ];

    // Data Excel
    stockData.forEach((s) => {
      worksheet.addRow({
        tanggal: new Date(s.createdAt).toLocaleString("id-ID"),
        type: s.type,
        qty: s.qty,
        unit: s.unit?.short || "-",
        note: s.note || "-",
      });
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=stock_summary_${product.name}.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error("Export summary error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ===========================
// Export Riwayat Stok per Produk (Excel)
// ===========================
exports.exportStockHistory = async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ success: false, message: "Produk tidak ditemukan" });
    }

    const stockData = await StockTransaction.find({ product: productId })
      .populate("unit", "short")
      .sort({ createdAt: 1 });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Riwayat Stok");

    // Header Excel
    worksheet.columns = [
      { header: "Tanggal", key: "tanggal", width: 25 },
      { header: "Tipe", key: "type", width: 10 },
      { header: "Qty", key: "qty", width: 10 },
      { header: "Unit", key: "unit", width: 15 },
      { header: "Catatan", key: "note", width: 40 },
    ];

    // Isi data Excel
    stockData.forEach((s) => {
      worksheet.addRow({
        tanggal: new Date(s.createdAt).toLocaleString("id-ID"),
        type: s.type,
        qty: s.qty,
        unit: s.unit?.short || "-",
        note: s.note || "-",
      });
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=stock_history_${product.name}.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error("🔥 exportStockHistory Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};



