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

// Summary stok per produk (semua produk)
exports.getStockSummary = async (req, res) => {
  try {
    const summary = await StockTransaction.aggregate([
      {
        $group: {
          _id: { product: "$product", unitBase: "$unitBase" },
          totalIn: { $sum: { $cond: [{ $eq: ["$type", "IN"] }, "$qtyBase", 0] } },
          totalOut: { $sum: { $cond: [{ $eq: ["$type", "OUT"] }, "$qtyBase", 0] } },
        },
      },
      {
        $addFields: { balance: { $subtract: ["$totalIn", "$totalOut"] } },
      },
      {
        $lookup: { from: "products", localField: "_id.product", foreignField: "_id", as: "product" },
      },
      { $unwind: "$product" },
      {
        $lookup: { from: "units", localField: "_id.unitBase", foreignField: "_id", as: "unitBase" },
      },
      { $unwind: "$unitBase" },
      {
        $project: {
          _id: 0,
          productId: "$product._id",
          productName: "$product.name",
          unitBase: { _id: "$unitBase._id", short: "$unitBase.short", name: "$unitBase.name" },
          totalIn: 1,
          totalOut: 1,
          balance: 1,
        },
      },
    ]);

    res.json({ success: true, data: summary });
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
    summary.forEach((s) => { result[s._id] = s.totalQty; });

    res.json({
      success: true,
      data: {
        product: productId,
        totalIn: result.IN,
        totalOut: result.OUT,
        balance: result.IN - result.OUT,
      },
    });
  } catch (err) {
    console.error("🔥 getStockSummaryByProduct Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Riwayat transaksi stok per produk (dengan filter tanggal opsional)
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

// Rekap semua produk dalam periode
exports.getAllStockSummary = async (req, res) => {
  try {
    const { start, end } = req.query;
    const match = {};

    if (start && end) {
      match.createdAt = { $gte: new Date(start), $lte: new Date(end) };
    }

    const summary = await StockTransaction.aggregate([
      { $match: match },
      {
        $group: {
          _id: { product: "$product", type: "$type" },
          totalQty: { $sum: "$qtyBase" },
        },
      },
      {
        $group: {
          _id: "$_id.product",
          summary: { $push: { type: "$_id.type", totalQty: "$totalQty" } },
        },
      },
      {
        $lookup: { from: "products", localField: "_id", foreignField: "_id", as: "product" },
      },
      { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          product: { _id: "$_id", name: { $ifNull: ["$product.name", "Unknown"] } },
          totalIn: {
            $ifNull: [
              { $first: { $map: { input: { $filter: { input: "$summary", cond: { $eq: ["$$this.type", "IN"] } } }, as: "s", in: "$$s.totalQty" } } },
              0,
            ],
          },
          totalOut: {
            $ifNull: [
              { $first: { $map: { input: { $filter: { input: "$summary", cond: { $eq: ["$$this.type", "OUT"] } } }, as: "s", in: "$$s.totalQty" } } },
              0,
            ],
          },
        },
      },
      { $addFields: { balance: { $subtract: ["$totalIn", "$totalOut"] } } },
    ]);

    res.json({ success: true, data: summary });
  } catch (err) {
    console.error("🔥 getAllStockSummary Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ===========================
   EXPORT EXCEL
=========================== */
exports.exportStockSummary = async (req, res) => {
  try {
    const { start, end } = req.query;
    const match = {};

    if (start && end) {
      match.createdAt = { $gte: new Date(start), $lte: new Date(end) };
    }

    const summary = await StockTransaction.aggregate([
      { $match: match },
      {
        $group: {
          _id: { product: "$product", type: "$type" },
          totalQty: { $sum: "$qtyBase" },
        },
      },
      {
        $group: {
          _id: "$_id.product",
          summary: { $push: { type: "$_id.type", totalQty: "$totalQty" } },
        },
      },
    ]);

    // Format hasil
    const results = [];
    for (const s of summary) {
      const product = await Product.findById(s._id).select("name");
      const totals = { IN: 0, OUT: 0 };
      s.summary.forEach((t) => { totals[t.type] = t.totalQty; });

      results.push({
        productName: product?.name || "Unknown",
        totalIn: totals.IN,
        totalOut: totals.OUT,
        balance: totals.IN - totals.OUT,
      });
    }

    // Buat Excel
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Stock Summary");

    worksheet.columns = [
      { header: "No", key: "no", width: 5 },
      { header: "Produk", key: "productName", width: 30 },
      { header: "Total Masuk", key: "totalIn", width: 15 },
      { header: "Total Keluar", key: "totalOut", width: 15 },
      { header: "Saldo", key: "balance", width: 15 },
    ];

    results.forEach((item, idx) => {
      worksheet.addRow({ no: idx + 1, ...item });
    });

    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true };
      cell.alignment = { horizontal: "center" };
    });

    res.setHeader("Content-Disposition", "attachment; filename=stock-summary.xlsx");
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error("🔥 exportStockSummary Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// =======================
// EXPORT STOCK SUMMARY / HISTORY
// =======================
exports.exportStock = async (req, res) => {
  try {
    const { type, productId } = req.query;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Stock Report");

    if (type === "summary") {
      
      if (productId) {
        const tx = await StockTransaction.find({ product: productId })
          .populate("product")
          .populate("unit");

        let totalIn = 0,
          totalOut = 0;

        tx.forEach((t) => {
          if (t.type === "IN") totalIn += t.qty;
          if (t.type === "OUT") totalOut += t.qty;
        });

        const balance = totalIn - totalOut;

        worksheet.columns = [
          { header: "Produk", key: "product", width: 30 },
          { header: "Total In", key: "in", width: 15 },
          { header: "Total Out", key: "out", width: 15 },
          { header: "Saldo", key: "balance", width: 15 },
          { header: "Unit", key: "unit", width: 10 },
        ];

        worksheet.addRow({
          product: tx[0]?.product?.name || "-",
          in: totalIn,
          out: totalOut,
          balance,
          unit: tx[0]?.unit?.short || "-",
        });
      } else {
        // summary all products
        const tx = await StockTransaction.find({})
          .populate("product")
          .populate("unit");

        const summaryMap = {};

        tx.forEach((t) => {
          const pid = t.product?._id;
          if (!pid) return;

          if (!summaryMap[pid]) {
            summaryMap[pid] = {
              product: t.product?.name,
              unit: t.unit?.short,
              in: 0,
              out: 0,
            };
          }

          if (t.type === "IN") summaryMap[pid].in += t.qty;
          if (t.type === "OUT") summaryMap[pid].out += t.qty;
        });

        worksheet.columns = [
          { header: "Produk", key: "product", width: 30 },
          { header: "Total In", key: "in", width: 15 },
          { header: "Total Out", key: "out", width: 15 },
          { header: "Saldo", key: "balance", width: 15 },
          { header: "Unit", key: "unit", width: 10 },
        ];

        Object.values(summaryMap).forEach((s) => {
          worksheet.addRow({
            product: s.product,
            in: s.in,
            out: s.out,
            balance: s.in - s.out,
            unit: s.unit,
          });
        });
      }
    } else if (type === "history") {
      if (!productId) {
        return res.status(400).json({
          success: false,
          message: "productId wajib untuk export history",
        });
      }

      const history = await StockTransaction.find({ product: productId })
        .sort({ createdAt: 1 })
        .populate("product")
        .populate("unit");

      worksheet.columns = [
        { header: "Tanggal", key: "date", width: 20 },
        { header: "Produk", key: "product", width: 30 },
        { header: "Tipe", key: "type", width: 10 },
        { header: "Qty", key: "qty", width: 10 },
        { header: "Unit", key: "unit", width: 10 },
        { header: "Note", key: "note", width: 30 },
      ];

      history.forEach((h) => {
        worksheet.addRow({
          date: new Date(h.createdAt).toLocaleString("id-ID"),
          product: h.product?.name,
          type: h.type,
          qty: h.qty,
          unit: h.unit?.short,
          note: h.note || "-",
        });
      });
    } else {
      return res.status(400).json({ success: false, message: "type tidak valid" });
    }

    
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", `attachment; filename=stock_${type}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error("Export error:", err);
    res.status(500).json({ success: false, message: "Gagal export" });
  }
};
// stockController.js
exports.exportStockSummaryByProduct = (req, res) => {
  req.query.type = "summary";
  req.query.productId = req.params.productId;
  return exports.exportStock(req, res);
};

exports.exportStockHistory = (req, res) => {
  req.query.type = "history";
  req.query.productId = req.params.productId;
  return exports.exportStock(req, res);
};
