const createHttpError = require("http-errors");
const { savePaymentFromOrder } = require("./paymentController");
const Order = require("../models/orderModel");
const Dish = require("../models/dishesModel");
const DishBOM = require("../models/dishBOMModel");
const Product = require("../models/productModel");
const StockTransaction = require("../models/stockModel");
const { default: mongoose } = require("mongoose");


const addOrder = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const orderId = `#${Date.now()}${Math.floor(Math.random() * 1000)}`;
    const { items, ...rest } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      throw createHttpError(400, "Items tidak boleh kosong.");
    }

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

        return {
          dishId: dish._id,
          name: dish.name,
          unitPrice: price,
          qty,
          variant: item.variant || "",
          totalPrice: price * qty,
        };
      })
    );

    const order = new Order({
      ...rest,
      orderId,
      items: detailedItems,
    });

    await order.save({ session });

    /**
     * 🔹 Update stok berdasarkan BOM
     */
    for (const item of detailedItems) {
      const bomList = await DishBOM.find({ dish: item.dishId }).populate("product unit");

      for (const bom of bomList) {
        const qtyToDeduct = bom.qty * item.qty;

        // ambil data product buat unitBase
        const product = await Product.findById(bom.product).populate("defaultUnit");
        if (!product) {
          throw createHttpError(404, `Product tidak ditemukan untuk BOM ${bom.product}`);
        }

        // simpan transaksi stok
        await StockTransaction.create(
          [
            {
              product: product._id,
              type: "OUT",
              qty: bom.qty, // jumlah sesuai BOM
              unit: bom.unit, // unit dari BOM
              qtyBase: qtyToDeduct, // total kebutuhan dalam unit dasar
              unitBase: product.defaultUnit, // unit dasar product
              note: `Dipakai untuk order ${order.orderId}`,
              relatedOrder: order._id,
              relatedDish: item.dishId,
            },
          ],
          { session }
        );

        // update stok product
        await Product.updateOne(
          { _id: product._id },
          { $inc: { stockBase: -qtyToDeduct } },
          { session }
        );
      }
    }

    // simpan payment
    await savePaymentFromOrder(order, req.body);

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



const getOrderById = async (req, res, next) => {
    try {

        const {id} = req.params;

        if(!mongoose.Types.ObjectId.isValid(id)){
            const error = createHttpError(404, "Invalid id!");
            return next(error);
        }
        
        const order = await Order.findById(id);
        if(!order){
            const error = createHttpError(404, "Order not found!");
            return next(error);
        }
        res.status(200).json({success: true, data: order});

    } catch (error) {
        return next(error);
    }
}

const getOrders = async (req, res, next) => {
    try {

        const orders = await Order.find().populate("table");
        res.status(200).json({data: orders});
        
    } catch (error) {
        return next(error);
    }
}

const updateOrder = async (req, res, next) => {
    try {

    
        const{orderStatus} = req.body;

        const {id} = req.params;

        if(!mongoose.Types.ObjectId.isValid(id)){
            const error = createHttpError(404, "Invalid id!");
            return next(error);
        }

        const order = await Order.findByIdAndUpdate(
            id,
            {orderStatus},
            {new: true}
        );

        if(!order){
            const error = createHttpError(404, "Order not found !");
            return next(error);
        }

        res.status(200).json({success: true, message: "Order updated !", data: order});
        
    } catch (error) {
        return next(error);
    }
}

const getPopularDishes = async (req, res) => {
  try {
    const popular = await Order.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.dishId",
          totalOrders: { $sum: "$items.qty" }
        }
      },
      {
        $lookup: {
          from: "dishes",
          localField: "_id",
          foreignField: "_id",
          as: "dishInfo"
        }
      },
      { $unwind: "$dishInfo" },
      {
        $project: {
          _id: "$dishInfo._id",
          name: "$dishInfo.name",
          image: "$dishInfo.image",
          totalOrders: 1
        }
      },
      { $sort: { totalOrders: -1 } },
      { $limit: 5 }
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


module.exports = {addOrder, getOrderById, getOrders, updateOrder, getPopularDishes};

