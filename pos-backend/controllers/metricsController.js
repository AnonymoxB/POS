const Expense = require("../models/expenseModel");
const Purchase = require("../models/purchaseModel");
const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const StockTransaction = require("../models/stockModel");
const Dish = require("../models/dishesModel");

exports.getMetrics = async (req, res) => {
  try {
    const { range = "month", category } = req.query;

    // ==================== RANGE ====================
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

    // ==================== METRICS GLOBAL ====================
    const totalRevenue = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: null, total: { $sum: "$bills.totalWithTax" } } },
    ]).catch(() => []);

    const totalExpense = await Expense.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]).catch(() => []);

    const totalPurchase = await Purchase.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: null, total: { $sum: "$grandTotal" } } },
    ]).catch(() => []);

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

    const stockSummary = await StockTransaction.aggregate(stockQuery).catch(
      () => []
    );

    // ==================== CHART ====================
    const groupFormat =
      range === "day" || range === "week" ? "%Y-%m-%d" : "%Y-%m";

    const incomeChart = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: groupFormat, date: "$createdAt" } },
          totalIncome: { $sum: "$bills.totalWithTax" },
        },
      },
      { $sort: { _id: 1 } },
    ]).catch(() => []);

    const expenseChart = await Expense.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: groupFormat, date: "$createdAt" } },
          totalExpense: { $sum: "$amount" },
        },
      },
      { $sort: { _id: 1 } },
    ]).catch(() => []);

    const purchaseChart = await Purchase.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: groupFormat, date: "$createdAt" } },
          totalPurchase: { $sum: "$grandTotal" },
        },
      },
      { $sort: { _id: 1 } },
    ]).catch(() => []);

    // Gabungan income & expense
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

    // ==================== PROFIT GLOBAL ====================
    const profit =
      (totalRevenue[0]?.total || 0) -
      ((totalExpense[0]?.total || 0) + (totalPurchase[0]?.total || 0));

    const profitChart = [];
    const profitDates = new Set([
      ...incomeChart.map((d) => d._id),
      ...expenseChart.map((d) => d._id),
      ...purchaseChart.map((d) => d._id),
    ]);

    profitDates.forEach((date) => {
      const income = incomeChart.find((i) => i._id === date)?.totalIncome || 0;
      const expense =
        expenseChart.find((e) => e._id === date)?.totalExpense || 0;
      const purchase =
        purchaseChart.find((p) => p._id === date)?.totalPurchase || 0;

      profitChart.push({
        date,
        profit: income - (expense + purchase),
      });
    });

    profitChart.sort((a, b) => new Date(a.date) - new Date(b.date));

    // ==================== PROFIT PER DISH ====================
const orders = await Order.find({ createdAt: { $gte: startDate } })
.populate("items.dishId") // ✅ populate dishId, bukan dish
.catch(() => []);

const dishes = await Dish.find()
.populate("bom.product")
.catch(() => []);

const profitPerDish = (dishes || []).map((dish) => {
// 🔹 Hitung HPP (biaya produksi per porsi)
const hpp = (dish.bom || []).reduce((sum, bom) => {
  const productPrice = bom.product?.purchasePrice || 0;
  const qty = bom.qtyBase ?? bom.qty ?? 0;
  return sum + qty * productPrice;
}, 0);

// 🔹 Hitung total sold hot & ice
let totalHot = 0;
let totalIce = 0;

(orders || []).forEach((order) => {
  order.items.forEach((i) => {
    if (i.dishId && i.dishId._id && i.dishId._id.equals(dish._id)) {
      if (i.variant === "hot") totalHot += i.qty;
      if (i.variant === "ice") totalIce += i.qty;
    }
  });
});

// 🔹 Revenue & Profit per variant
const revenueHot = (dish.price?.hot || 0) * totalHot;
const revenueIce = (dish.price?.ice || 0) * totalIce;
const profitHot = ((dish.price?.hot || 0) - hpp) * totalHot;
const profitIce = ((dish.price?.ice || 0) - hpp) * totalIce;

return {
  dish: dish.name,
  hpp,
  totalHot,
  totalIce,
  revenueHot,
  revenueIce,
  profitHot,
  profitIce,
};
});

res.json({ profitPerDish });

    // ==================== RESPONSE ====================
    const categories = await Product.distinct("category").catch(() => []);

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
            value: totalProducts || 0,
            percentage: "+5%",
            isIncrease: true,
            color: "#f59e0b",
            unit: "Item",
          },
        ],
        profit, // profit global
        profitChart,
        profitPerDish,
        itemsData: (stockSummary || []).map((item) => ({
          title: item.productName,
          value: item.balance,
          unit: item.unit,
        })),
        incomeExpenseChart: combinedChart,
        stockChart: (stockSummary || []).map((item) => ({
          product: item.productName,
          stock: item.balance,
          category: item.category,
        })),
        categories: ["all", ...(categories || [])],
      },
    });
  } catch (error) {
    console.error("🔥 getMetrics Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
