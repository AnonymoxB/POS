const StockTransaction = require("../models/stockModel");
const ExcelJS = require("exceljs");
const Product = require("../models/productModel");

// Ambil semua transaksi stok
exports.getStockTransactions = async (req, res) => {
  try {
    const { type, product, startDate, endDate } = req.query;
    let filter = {};

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
    res.status(500).json({ success: false, message: err.message });
  }
};

// Buat transaksi stok manual/ adjustment stok
exports.createStockTransaction = async (req, res) => {
  try {
    const transaction = await StockTransaction.create(req.body);
    res.status(201).json({ success: true, data: transaction });
  } catch (err) {
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
    res.status(500).json({ success: false, message: err.message });
  }
};


//Summary stok per product
exports.getStockSummary = async (req, res) => {
  try {
    const summary = await StockTransaction.aggregate([
      {
        $group: {
          _id: "$product",
          totalIn: {
            $sum: { $cond: [{ $eq: ["$type", "IN"] }, "$qty", 0] },
          },
          totalOut: {
            $sum: { $cond: [{ $eq: ["$type", "OUT"] }, "$qty", 0] },
          },
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
        $project: {
          _id: 0,
          productId: "$product._id",
          productName: "$product.name",
          totalIn: 1,
          totalOut: 1,
          balance: { $subtract: ["$totalIn", "$totalOut"] },
        },
      },
    ]);

    res.json({ success: true, data: summary });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

//Summary stok per product (by ID)
exports.getStockSummaryByProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const summary = await StockTransaction.aggregate([
      { $match: { product: new require("mongoose").Types.ObjectId(productId) } },
      {
        $group: {
          _id: "$product",
          totalIn: {
            $sum: { $cond: [{ $eq: ["$type", "IN"] }, "$qty", 0] },
          },
          totalOut: {
            $sum: { $cond: [{ $eq: ["$type", "OUT"] }, "$qty", 0] },
          },
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
        $project: {
          _id: 0,
          productId: "$product._id",
          productName: "$product.name",
          totalIn: 1,
          totalOut: 1,
          balance: { $subtract: ["$totalIn", "$totalOut"] },
        },
      },
    ]);

    if (summary.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No stock data found for this product" });
    }

    res.json({ success: true, data: summary[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

//Riwayat transaksi stok per produk
exports.getStockHistoryByProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const history = await StockTransaction.find({ product: productId })
      .populate("product", "name")
      .populate("unit", "short")
      .sort({ createdAt: -1 }); // urut terbaru dulu

    if (!history || history.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No stock history found for this product" });
    }

    res.json({ success: true, data: history });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

//Riwayat transaksi stok filter tanggal
exports.getStockHistoryByProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const { start, end } = req.query;

    let filter = { product: productId };

    
    if (start && end) {
      filter.createdAt = {
        $gte: new Date(start),
        $lte: new Date(end),
      };
    }

    const history = await StockTransaction.find(filter)
      .populate("product", "name")
      .populate("unit", "short")
      .sort({ createdAt: -1 });

    if (!history || history.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No stock history found for this product in given period",
      });
    }

    res.json({ success: true, data: history });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

//Rekap stok in & out per produk dalam periode
exports.getStockSummaryByProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const { start, end } = req.query;

    let match = { product: productId };

    if (start && end) {
      match.createdAt = {
        $gte: new Date(start),
        $lte: new Date(end),
      };
    }

    const summary = await StockTransaction.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$type",
          totalQty: { $sum: "$qty" },
        },
      },
    ]);

    
    const result = {
      IN: 0,
      OUT: 0,
    };

    summary.forEach((s) => {
      result[s._id] = s.totalQty;
    });

    res.json({
      success: true,
      data: {
        product: productId,
        totalIn: result.IN,
        totalOut: result.OUT,
        balance: result.IN - result.OUT, // sisa stok dari transaksi
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

//Rekap stok semua produk dalam periode
exports.getAllStockSummary = async (req, res) => {
  try {
    const { start, end } = req.query;

    let match = {};
    if (start && end) {
      match.createdAt = {
        $gte: new Date(start),
        $lte: new Date(end),
      };
    }

    const summary = await StockTransaction.aggregate([
      { $match: match },
      {
        $group: {
          _id: { product: "$product", type: "$type" },
          totalQty: { $sum: "$qty" },
        },
      },
      {
        $group: {
          _id: "$_id.product",
          summary: {
            $push: {
              type: "$_id.type",
              totalQty: "$totalQty",
            },
          },
        },
      },
      {
        $lookup: {
          from: "products", // nama collection Product di MongoDB
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },
      {
        $unwind: {
          path: "$product",
          preserveNullAndEmptyArrays: true, // kalau product sudah dihapus/null tetap aman
        },
      },
      {
        $project: {
          _id: 0,
          product: {
            _id: "$_id",
            name: { $ifNull: ["$product.name", "Unknown"] },
          },
          totalIn: {
            $ifNull: [
              {
                $first: {
                  $map: {
                    input: {
                      $filter: {
                        input: "$summary",
                        cond: { $eq: ["$$this.type", "IN"] },
                      },
                    },
                    as: "s",
                    in: "$$s.totalQty",
                  },
                },
              },
              0,
            ],
          },
          totalOut: {
            $ifNull: [
              {
                $first: {
                  $map: {
                    input: {
                      $filter: {
                        input: "$summary",
                        cond: { $eq: ["$$this.type", "OUT"] },
                      },
                    },
                    as: "s",
                    in: "$$s.totalQty",
                  },
                },
              },
              0,
            ],
          },
        },
      },
      {
        $addFields: {
          balance: { $subtract: ["$totalIn", "$totalOut"] },
        },
      },
    ]);

    res.json({ success: true, data: summary });
  } catch (err) {
    console.error("🔥 getAllStockSummary Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};



//Export stok summary ke Excel
exports.exportStockSummary = async (req, res) => {
  try {
    const { start, end } = req.query;

    let match = {};
    if (start && end) {
      match.createdAt = {
        $gte: new Date(start),
        $lte: new Date(end),
      };
    }

    const summary = await StockTransaction.aggregate([
      { $match: match },
      {
        $group: {
          _id: { product: "$product", type: "$type" },
          totalQty: { $sum: "$qty" },
        },
      },
      {
        $group: {
          _id: "$_id.product",
          summary: {
            $push: {
              type: "$_id.type",
              totalQty: "$totalQty",
            },
          },
        },
      },
    ]);

    // Format hasil rapi
    const results = [];
    for (const s of summary) {
      const product = await Product.findById(s._id).select("name");
      const totals = { IN: 0, OUT: 0 };

      s.summary.forEach((t) => {
        totals[t.type] = t.totalQty;
      });

      results.push({
        productName: product?.name || "Unknown",
        totalIn: totals.IN,
        totalOut: totals.OUT,
        balance: totals.IN - totals.OUT,
      });
    }

    // Excel
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Stock Summary");

    // Header
    worksheet.columns = [
      { header: "No", key: "no", width: 5 },
      { header: "Produk", key: "productName", width: 30 },
      { header: "Total Masuk", key: "totalIn", width: 15 },
      { header: "Total Keluar", key: "totalOut", width: 15 },
      { header: "Saldo", key: "balance", width: 15 },
    ];

    // Isi data
    results.forEach((item, idx) => {
      worksheet.addRow({
        no: idx + 1,
        ...item,
      });
    });

    // Style header
    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true };
      cell.alignment = { horizontal: "center" };
    });

    // Kirim file
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=stock-summary.xlsx"
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};




