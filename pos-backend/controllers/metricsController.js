const StockTransaction = require("../models/StockTransaction");
const Expense = require("../models/Expense");
const Purchase = require("../models/Purchase");
const Order = require("../models/Order");
const Product = require("../models/Product");

exports.getMetrics = async (req, res) => {
  try {
    // Hitung total pendapatan (dari orders)
    const totalRevenue = await Order.aggregate([
      { $match: { status: "PAID" } },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } },
    ]);

    // Hitung total pengeluaran
    const totalExpense = await Expense.aggregate([
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    // Hitung total pembelian bahan
    const totalPurchase = await Purchase.aggregate([
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]);

    // Hitung total produk
    const totalProducts = await Product.countDocuments();

    // Ambil stok per produk
    const stockSummary = await StockTransaction.aggregate([
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
        $project: {
          productId: "$_id",
          productName: "$product.name",
          balance: { $subtract: ["$totalIn", "$totalOut"] },
          unit: "$product.baseUnit",
        },
      },
    ]);

    // Ambil data chart: total penjualan per bulan
    const chartData = await Order.aggregate([
      {
        $group: {
          _id: { $substr: ["$createdAt", 0, 7] }, // contoh: 2025-09
          value: { $sum: "$totalPrice" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      success: true,
      metricsData: [
        {
          title: "Pendapatan",
          value: totalRevenue[0]?.total || 0,
          percentage: "+12%",
          isIncrease: true,
          color: "#4f46e5",
          unit: "Rp",
        },
        {
          title: "Pengeluaran",
          value: totalExpense[0]?.total || 0,
          percentage: "-4%",
          isIncrease: false,
          color: "#dc2626",
          unit: "Rp",
        },
        {
          title: "Pembelian Bahan",
          value: totalPurchase[0]?.total || 0,
          percentage: "+8%",
          isIncrease: true,
          color: "#059669",
          unit: "Rp",
        },
        {
          title: "Total Produk",
          value: totalProducts,
          percentage: "+5%",
          isIncrease: true,
          color: "#f59e0b",
          unit: "Item",
        },
      ],
      itemsData: stockSummary.map((item) => ({
        title: item.productName,
        value: item.balance,
        percentage: "+0%",
        color: "#4f46e5",
        unit: "pcs",
      })),
      chartData: chartData.map((c) => ({
        month: c._id,
        value: c.value,
      })),
    });
  } catch (error) {
    console.error("🔥 getMetrics Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
