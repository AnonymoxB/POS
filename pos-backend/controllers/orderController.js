const createHttpError = require("http-errors");
const { savePaymentFromOrder } = require("./paymentController");
const Order = require("../models/orderModel");
const Dish = require("../models/dishesModel");
const DishBOM = require("../models/dishBOMModel");
const Product = require("../models/productModel");
const StockTransaction = require("../models/stockModel");
const { default: mongoose } = require("mongoose");
const { convertQty } = require("../utils/unitConverter");
const { hitungHppDish } = require("../utils/hppCalculator");

// ================== ADD ORDER ==================
const addOrder = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const orderId = `#${Date.now()}${Math.floor(Math.random() * 1000)}`;
    const { items, ...rest } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      throw createHttpError(400, "Items tidak boleh kosong.");
    }

    // Detailkan item order
    const detailedItems = await Promise.all(
      items.map(async (item) => {
        if (!item.dishId || !mongoose.Types.ObjectId.isValid(item.dishId)) {
          throw createHttpError(400, `dishId tidak valid: ${item.dishId}`);
        }

        const dish = await Dish.findById(item.dishId);
        if (!dish) {
          throw createHttpError(404, `Menu tidak ditemukan untuk dishId: ${item.dishId}`);
        }

        const price = typeof dish.price === "object" ? 0 : dish.price;
        const qty = item.qty || item.quantity || 1;

        // 🔹 Hitung HPP per dish (pakai BOM)
        const hpp = await hitungHppDish(dish._id, qty, item.variant || "");

        return {
          dishId: dish._id,
          name: dish.name,
          unitPrice: price,
          qty,
          variant: item.variant || "",
          totalPrice: price * qty,
          hpp, // ✅ simpan hpp langsung di item order
        };
      })
    );

    // Simpan order utama
    const order = new Order({
      ...rest,
      orderId,
      items: detailedItems,
    });
    await order.save({ session });

    // Update stok dari BOM (kode kamu tetap sama)
    for (const item of detailedItems) {
      const bomList = await DishBOM.find({
        dish: item.dishId,
        variant: item.variant,
      })
        .populate({ path: "product", populate: "defaultUnit" })
        .populate("unit");

      for (const bom of bomList) {
        const totalBomQty = bom.qty * item.qty;
        const product = bom.product;

        if (!product) throw createHttpError(404, `Product tidak ditemukan untuk BOM ${bom._id}`);
        if (!product.defaultUnit) throw createHttpError(400, `Produk ${product.name} belum punya default unit`);

        let qtyBase;
        try {
          qtyBase = await convertQty(totalBomQty, bom.unit._id, product.defaultUnit._id, product);
          console.log(`[CONVERT OK] ${totalBomQty} ${bom.unit?.short} -> ${qtyBase} ${product.defaultUnit?.short}`);
        } catch (err) {
          console.error(`[CONVERT FAIL] Product: ${product.name}, BOM Unit: ${bom.unit?.short}, Default: ${product.defaultUnit?.short}`);
          throw err;
        }

        if (qtyBase <= 0) {
          throw createHttpError(400, `Konversi unit invalid untuk produk ${product.name}`);
        }

        // Ambil ulang product dengan session
        const productDoc = await Product.findById(product._id).session(session);
        if (!productDoc) throw createHttpError(404, `Produk ${product.name} tidak ditemukan`);

        // Cek stok cukup
        if (productDoc.stockBase < qtyBase) {
          throw createHttpError(
            400,
            `Stok ${product.name} tidak cukup. Dibutuhkan ${qtyBase} ${product.defaultUnit.short}, tersedia hanya ${productDoc.stockBase}`
          );
        }

        // Update stok
        productDoc.stockBase -= qtyBase;
        await productDoc.save({ session });

        // Simpan transaksi stok
        await StockTransaction.create(
          [
            {
              product: product._id,
              type: "OUT",
              qty: totalBomQty,
              unit: bom.unit._id,
              qtyBase,
              unitBase: product.defaultUnit._id,
              note: `Dipakai untuk order ${order.orderId}`,
              relatedOrder: order._id,
              relatedDish: item.dishId,
            },
          ],
          { session }
        );
      }
    }

    // Simpan payment
    await savePaymentFromOrder(order, req.user?._id?.toString() || null);

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      success: true,
      message: "Order berhasil dibuat & stok bahan dipotong!",
      data: order,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("ORDER CREATE ERROR:", error);
    return next(error);
  }
};

// ================== GET ORDER BY ID ==================
const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(createHttpError(404, "Invalid id!"));
    }
    const order = await Order.findById(id);
    if (!order) return next(createHttpError(404, "Order not found!"));
    res.status(200).json({ success: true, data: order });
  } catch (error) {
    return next(error);
  }
};

// ================== GET ALL ORDERS ==================
const getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find().populate("table");
    res.status(200).json({ data: orders });
  } catch (error) {
    return next(error);
  }
};

// ================== UPDATE ORDER ==================
const updateOrder = async (req, res, next) => {
  try {
    const { orderStatus } = req.body;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(createHttpError(404, "Invalid id!"));
    }

    const order = await Order.findByIdAndUpdate(
      id,
      { orderStatus },
      { new: true }
    );

    if (!order) return next(createHttpError(404, "Order not found!"));

    res.status(200).json({ success: true, message: "Order updated!", data: order });
  } catch (error) {
    return next(error);
  }
};

// ================== POPULAR DISHES ==================
const getPopularDishes = async (req, res) => {
  try {
    const popular = await Order.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.dishId",
          totalOrders: { $sum: "$items.qty" },
        },
      },
      {
        $lookup: {
          from: "dishes",
          localField: "_id",
          foreignField: "_id",
          as: "dishInfo",
        },
      },
      { $unwind: "$dishInfo" },
      {
        $project: {
          _id: "$dishInfo._id",
          name: "$dishInfo.name",
          image: "$dishInfo.image",
          totalOrders: 1,
        },
      },
      { $sort: { totalOrders: -1 } },
      { $limit: 5 },
    ]);

    res.status(200).json({
      success: true,
      message: "Daftar menu populer",
      data: popular,
    });
  } catch (err) {
    console.error("Error popular dish:", err);
    res.status(500).json({ success: false, message: "Gagal mengambil data populer" });
  }
};

// ================== METRICS (DASHBOARD) ==================
const getOrderMetrics = async (req, res) => {
  try {
    const today = new Date();
    const startOfToday = new Date(today.setHours(0, 0, 0, 0));
    const startOfYesterday = new Date(startOfToday);
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);

    const endOfYesterday = new Date(startOfToday);
    endOfYesterday.setMilliseconds(-1);

    // Semua order
    const orders = await Order.find();

    // Hari ini & kemarin
    const todayOrders = await Order.find({ orderDate: { $gte: startOfToday } });
    const yesterdayOrders = await Order.find({
      orderDate: { $gte: startOfYesterday, $lte: endOfYesterday },
    });

    // Total
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + (o.bills?.totalWithTax || 0), 0);
    const uniqueCustomers = new Set(
      orders.map((o) => o.customerDetails?.name || o.customerDetails?.phone)
    );
    const totalCustomers = uniqueCustomers.size;

    // Growth %
    const calcGrowth = (todayVal, yesterdayVal) => {
      if (yesterdayVal === 0) return todayVal > 0 ? 100 : 0;
      return (((todayVal - yesterdayVal) / yesterdayVal) * 100).toFixed(1);
    };

    const ordersGrowth = calcGrowth(todayOrders.length, yesterdayOrders.length);
    const revenueGrowth = calcGrowth(
      todayOrders.reduce((s, o) => s + (o.bills?.totalWithTax || 0), 0),
      yesterdayOrders.reduce((s, o) => s + (o.bills?.totalWithTax || 0), 0)
    );
    const customersGrowth = calcGrowth(
      new Set(todayOrders.map((o) => o.customerDetails?.name || o.customerDetails?.phone)).size,
      new Set(yesterdayOrders.map((o) => o.customerDetails?.name || o.customerDetails?.phone)).size
    );

    res.status(200).json({
      success: true,
      data: {
        totalOrders,
        ordersGrowth,
        totalRevenue,
        revenueGrowth,
        totalCustomers,
        customersGrowth,
      },
    });
  } catch (err) {
    console.error("❌ Error getOrderMetrics:", err);
    res.status(500).json({ success: false, message: "Gagal ambil metrics" });
  }
};

// ================== PROFIT PER DISH ==================
const getProfitPerDish = async (req, res) => {
  try {
    const profitData = await Order.aggregate([
      { $unwind: "$items" },
      {
        $lookup: {
          from: "dishes",
          localField: "items.dishId",
          foreignField: "_id",
          as: "dishInfo",
        },
      },
      { $unwind: "$dishInfo" },
      {
        $group: {
          _id: "$items.dishId",
          name: { $first: "$dishInfo.name" },
          totalQty: { $sum: "$items.qty" },
          revenue: { $sum: "$items.totalPrice" },
          hpp: { $sum: "$items.hpp" }, // pastikan field hpp per item disimpan di order
        },
      },
      {
        $addFields: {
          profit: { $subtract: ["$revenue", "$hpp"] },
        },
      },
      { $sort: { profit: -1 } },
    ]);

    res.status(200).json({
      success: true,
      data: profitData,
    });
  } catch (err) {
    console.error("❌ Error getProfitPerDish:", err);
    res.status(500).json({ success: false, message: "Gagal ambil profit per dish" });
  }
};


module.exports = {
  addOrder,
  getOrderById,
  getOrders,
  updateOrder,
  getPopularDishes,
  getOrderMetrics,
  getProfitPerDish,
};
