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

// Summary stok per produk (semua produk)
exports.getStockSummary = async (req, res) => {
  try {
    const summary = await StockTransaction.aggregate([
      {
        $group: {
          _id: "$product",
          totalIn: { $sum: { $cond: [{ $eq: ["$type", "IN"] }, "$qtyBase", 0] } },
          totalOut:{ $sum: { $cond: [{ $eq: ["$type", "OUT"] }, "$qtyBase", 0] } }
        }
      },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product"
        }
      },
      { $unwind: "$product" },
      {
        $lookup: {
          from: "units",
          localField: "product.defaultUnit",
          foreignField: "_id",
          as: "defaultUnit"
        }
      },
      { $unwind: "$defaultUnit" },
      {
        $project: {
          productName: "$product.name",
          totalIn: 1,
          totalOut: 1,
          balance: { $subtract: ["$totalIn", "$totalOut"] },
          unit: "$defaultUnit.short"
        }
      }
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

exports.exportStock = async (req, res) => {
  try {
    const { type, productId, start, end } = req.query;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Stock Report");

    // Build filter
    const filter = {};
    if (productId) filter.product = productId;
    if (start && end) {
      filter.createdAt = { $gte: new Date(start), $lte: new Date(end) };
    }

    if (type === "summary") {
      const tx = await StockTransaction.find(filter)
        .populate("product")
        .populate("unit")
        .lean();

      const summaryMap = {};
      tx.forEach((t) => {
        const pid = t.product?._id?.toString();
        if (!pid) return;

        if (!summaryMap[pid]) {
          summaryMap[pid] = {
            product: t.product?.name || "-",
            unit: t.unit?.short || "-",
            in: 0,
            out: 0,
          };
        }
        if (t.type === "IN") summaryMap[pid].in += Number(t.qty) || 0;
        if (t.type === "OUT") summaryMap[pid].out += Number(t.qty) || 0;
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

    } else if (type === "history") {
      if (!productId) {
        return res.status(400).json({
          success: false,
          message: "productId wajib untuk export history",
        });
      }

      const history = await StockTransaction.find(filter)
        .sort({ createdAt: 1 })
        .populate("product")
        .populate("unit")
        .lean();

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
          date: h.createdAt
            ? new Date(h.createdAt).toLocaleString("id-ID")
            : "-",
          product: h.product?.name || "-",
          type: h.type || "-",
          qty: Number(h.qty) || 0,
          unit: h.unit?.short || "-",
          note: h.note || "-",
        });
      });
    } else {
      return res
        .status(400)
        .json({ success: false, message: "type tidak valid" });
    }

    // --- Styling ---
    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF4B5563" }, // abu-abu gelap
      };
      cell.alignment = { vertical: "middle", horizontal: "center" };
    });

    worksheet.eachRow((row) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin", color: { argb: "FFAAAAAA" } },
          left: { style: "thin", color: { argb: "FFAAAAAA" } },
          bottom: { style: "thin", color: { argb: "FFAAAAAA" } },
          right: { style: "thin", color: { argb: "FFAAAAAA" } },
        };
        if (typeof cell.value === "number") {
          cell.alignment = { horizontal: "center" };
        }
      });
    });

    // --- Auto Naming ---
    let filename = `stock_${type}`;
    if (productId) filename += `_${productId}`;
    if (start && end) {
      filename += `_${start}_${end}`;
    } else {
      filename += `_all`;
    }
    filename += `.xlsx`;

    const buffer = await workbook.xlsx.writeBuffer();

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${filename}"`
    );

    return res.send(buffer);
  } catch (err) {
    console.error("🔥 Export error:", err.message);
    console.error(err.stack);
    res
      .status(500)
      .json({ success: false, message: "Gagal export", error: err.message });
  }
};

// Shortcuts
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
