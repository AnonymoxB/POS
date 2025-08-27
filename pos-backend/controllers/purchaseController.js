const mongoose = require("mongoose");
const Purchase = require("../models/purchaseModel");
const Product = require("../models/productModel");
const StockTransaction = require("../models/stockModel");
const Unit = require("../models/unitModel");
const {savePaymentFromPurchase} = require("../helpers/paymentHelper");


// 🔧 Helper rekursif untuk cari baseUnit & qtyBase
async function getBaseUnitAndQty(unitId, qty, session) {
  const unitDoc = await Unit.findById(unitId).session(session);
  if (!unitDoc) {
    return { unitBase: unitId, qtyBase: qty };
  }

  // Kalau dia unit dasar (baseUnit == null)
  if (!unitDoc.baseUnit) {
    return {
      unitBase: unitDoc._id,
      qtyBase: qty * (unitDoc.conversion || 1),
    };
  }

  // Kalau masih punya baseUnit → rekursif
  return await getBaseUnitAndQty(
    unitDoc.baseUnit,
    qty * (unitDoc.conversion || 1),
    session
  );
}


exports.getPurchases = async (req, res) => {
  try {
    const purchases = await Purchase.find()
      .populate("supplier")
      .populate("items.product")
      .populate("items.unit");

    res.json({ success: true, data: purchases });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// ================= CREATE PURCHASE =================
exports.createPurchase = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const { supplier, items } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Items tidak boleh kosong",
      });
    }

    const grandTotal = items.reduce((sum, item) => sum + (item.total || 0), 0);

    // 🔹 generate purchaseId
    const purchaseId = `PUR-${Date.now()}`;

    const purchase = await Purchase.create(
      [{ purchaseId, supplier, items, grandTotal, createdBy: req.user?._id }],
      { session }
    );

    for (const item of items) {
      const product = await Product.findById(item.product).session(session);
      if (!product) continue;

      const oldStock = product.stock || 0;
      const oldValue = oldStock * (product.price || 0);
      const newValue = item.quantity * item.price;
      const newStock = oldStock + item.quantity;

      product.stock = newStock;
      product.price = newStock > 0 ? (oldValue + newValue) / newStock : item.price;
      await product.save({ session });

      // hitung unitBase & qtyBase
      const { unitBase, qtyBase } = await getBaseUnitAndQty(item.unit, item.quantity, session);

      await StockTransaction.create(
        [
          {
            product: product._id,
            type: "IN",
            qty: item.quantity,
            unit: item.unit,
            unitBase,
            qtyBase,
            note: "Purchase",
          },
        ],
        { session }
      );
    }

    const savedPurchase = purchase[0];

    // 🔹 simpan Payment otomatis dengan parameter lengkap
    await savePaymentFromPurchase(
      "Purchase",              // sourceType
      savedPurchase._id,       // sourceId
      grandTotal,              // amount
      "Cash",                  // method
      "In",                    // direction
      req.user?._id,           // userId
      session                  // session
    );

    
    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      success: true,
      message: "Purchase & Payment berhasil dibuat",
      data: savedPurchase,
    });
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    session.endSession();
    res.status(400).json({ success: false, message: error.message });
  }
};





// ================= UPDATE PURCHASE =================
exports.updatePurchase = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { id } = req.params;
    const { supplier, items } = req.body;

    const oldPurchase = await Purchase.findById(id).session(session);
    if (!oldPurchase) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ success: false, message: "Purchase not found" });
    }

    // rollback stok lama
    for (const oldItem of oldPurchase.items) {
      const product = await Product.findById(oldItem.product).session(session);
      if (!product) continue;
      product.stock -= oldItem.quantity;
      await product.save({ session });
    }

    const grandTotal = items.reduce((sum, item) => sum + item.total, 0);

    const updated = await Purchase.findByIdAndUpdate(
      id,
      { supplier, items, grandTotal },
      { new: true, session }
    );

    for (const item of items) {
      const product = await Product.findById(item.product).session(session);
      if (!product) continue;

      const oldStock = product.stock || 0;
      const oldValue = oldStock * (product.price || 0);
      const newValue = item.quantity * item.price;
      const newStock = oldStock + item.quantity;

      product.stock = newStock;
      product.price = newStock > 0 ? (oldValue + newValue) / newStock : item.price;
      await product.save({ session });

      // hitung unitBase & qtyBase
      const { unitBase, qtyBase } = await getBaseUnitAndQty(item.unit, item.quantity, session);

      await StockTransaction.create(
        [{
          product: product._id,
          type: "IN",
          qty: item.quantity,
          unit: item.unit,
          unitBase,
          qtyBase,
          note: "Purchase Update",
        }],
        { session }
      );
    }

    await session.commitTransaction();
    session.endSession();

    res.json({ success: true, data: updated });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ success: false, message: error.message });
  }
};


// ================= DELETE PURCHASE =================
exports.deletePurchase = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { id } = req.params;

    const deleted = await Purchase.findByIdAndDelete(id, { session });

    if (!deleted) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ success: false, message: "Purchase not found" });
    }

    for (const item of deleted.items) {
      const product = await Product.findById(item.product).session(session);
      if (!product) continue;

      product.stock -= item.quantity;
      await product.save({ session });

      // hitung unitBase & qtyBase
      const { unitBase, qtyBase } = await getBaseUnitAndQty(item.unit, item.quantity, session);

      await StockTransaction.create(
        [{
          product: product._id,
          type: "OUT",
          qty: item.quantity,
          unit: item.unit,
          unitBase,
          qtyBase,
          note: "Purchase Deleted",
        }],
        { session }
      );
    }

    await session.commitTransaction();
    session.endSession();

    res.json({ success: true, message: "Purchase deleted successfully" });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ success: false, message: error.message });
  }
};
