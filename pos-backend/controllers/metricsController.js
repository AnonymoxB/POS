const Expense = require("../models/expenseModel");
const Purchase = require("../models/purchaseModel");
const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const StockTransaction = require("../models/stockModel");

exports.getMetrics = async (req, res) => {
  try {
    const { range = "month", category } = req.query;

    // Hitung tanggal awal berdasarkan range
    const now = new Date();
    let startDate;
    if (range === "day") {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (range === "week") {
      const firstDayOfWeek = now.getDate() - now.getDay();
      startDate = new Date(now.getFullYear(), now.getMonth(), firstDayOfWeek);
    } else {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    // ==================== METRICS ====================

    // Total Pendapatan (SEMUA order dihitung)
    const totalRevenue = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: null, total: { $sum: "$bills.totalWithTax" } } },
    ]);

    // Total Pengeluaran
    const totalExpense = await Expense.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    // Total Pembelian bahan
    const totalPurchase = await Purchase.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: null, total: { $sum: "$grandTotal" } } },
    ]);

    // Total Produk
    const totalProducts = await Product.countDocuments();

    // ==================== STOK PRODUK ====================

    const stockQuery = [
      {
        $group: {
          _id: "$product",
          totalIn: {
            $sum: { $cond: [{ $eq: ["$type", "IN"] }, "$qtyBase", 0] },
          },
          totalOut: {
            $sum: { $cond: [{ $eq: ["$type", "OUT"] }, "$qtyBase", 0] },
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
    ];

    // Kalau ada filter kategori
    if (category && category !== "all") {
      stockQuery.push({ $match: { "product.category": category } });
    }

    stockQuery.push({
      $project: {
        productId: "$_id",
        productName: "$product.name",
        balance: { $subtract: ["$totalIn", "$totalOut"] },
        unit: "$product.baseUnit",
        category: "$product.category",
      },
    });

    const stockSummary = await StockTransaction.aggregate(stockQuery);

    // ==================== CHART ====================

    // Format tanggal sesuai range
    const groupFormat =
      range === "day" || range === "week" ? "%Y-%m-%d" : "%Y-%m";

    // Chart penjualan
    const salesChart = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: groupFormat, date: "$createdAt" } },
          total: { $sum: "$bills.totalWithTax" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Chart pendapatan
    const incomeChart = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: groupFormat, date: "$createdAt" } },
          totalIncome: { $sum: "$bills.totalWithTax" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Chart pengeluaran
    const expenseChart = await Expense.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: groupFormat, date: "$createdAt" } },
          totalExpense: { $sum: "$amount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Gabung income & expense jadi 1 chart
    const combinedChart = [];
    const dates = new Set([
      ...incomeChart.map((d) => d._id),
      ...expenseChart.map((d) => d._id),
    ]);

    dates.forEach((date) => {
      combinedChart.push({
        date,
        income: incomeChart.find((i) => i._id === date)?.totalIncome || 0,
        expense: expenseChart.find((e) => e._id === date)?.totalExpense || 0,
      });
    });

    combinedChart.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Ambil semua kategori produk
    const categories = await Product.distinct("category");

    // ==================== RESPONSE ====================
    res.json({
      success: true,
      data: {
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
          unit: item.unit,
        })),
        salesChart: salesChart.map((c) => ({
          date: c._id,
          totalAmount: c.total,
        })),
        incomeExpenseChart: combinedChart,
        stockChart: stockSummary.map((item) => ({
          product: item.productName,
          stock: item.balance,
          category: item.category,
        })),
        categories: ["all", ...categories],
      },
    });
  } catch (error) {
    console.error("🔥 getMetrics Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
