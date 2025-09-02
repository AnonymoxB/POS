const mongoose = require("mongoose");
const Purchase = require("../models/purchaseModel");
const Product = require("../models/productModel");
const StockTransaction = require("../models/stockModel");
const Unit = require("../models/unitModel");
const Payment = require("../models/paymentModel");
const { savePaymentFromPurchase } = require("../helpers/paymentHelper");
const { updateDishHPP } = require("../helpers/updateDishHPP");

// ================= UTILS =================
async function getBaseUnitAndQty(unitId, qty, session) {
  const unitDoc = await Unit.findById(unitId).session(session);
  if (!unitDoc) return { unitBase: unitId, qtyBase: qty };

  if (!unitDoc.baseUnit) {
    return { unitBase: unitDoc._id, qtyBase: qty * (unitDoc.conversion || 1) };
  }

  return await getBaseUnitAndQty(unitDoc.baseUnit, qty * (unitDoc.conversion || 1), session);
}

// ================= GET ALL PURCHASE =================
exports.getPurchases = async (req, res) => {
  try {
    const purchases = await Purchase.find()
      .populate("supplier", "name")
      .populate("items.product", "name")
      .populate("items.unit", "name short")
      .sort({ createdAt: -1 });

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
    if (!items || items.length === 0)
      return res.status(400).json({ success: false, message: "Items tidak boleh kosong" });

    // Validasi items
    for (const item of items) {
      if (!item.product || !item.unit || !item.quantity || !item.price) {
        throw new Error("Item harus punya product, unit, quantity, dan price");
      }
    }

    const grandTotal = items.reduce((sum, item) => sum + (item.total || 0), 0);
    const purchaseId = `PUR-${Date.now()}`;

    const purchase = await Purchase.create(
      [{ purchaseId, supplier, items, grandTotal, createdBy: req.user?._id }],
      { session }
    );

    const savedPurchase = purchase[0];

    // Proses setiap item: update stock & HPP
    for (const item of items) {
      const product = await Product.findById(item.product).session(session);
      if (!product) continue;

      const { unitBase, qtyBase } = await getBaseUnitAndQty(item.unit, item.quantity, session);

      const oldStock = product.stockBase || 0;
      const oldValue = oldStock * (product.hpp || 0);
      const newValue = qtyBase * item.price;
      const newStock = oldStock + qtyBase;

      product.stockBase = newStock;
      product.hpp = newStock > 0 ? (oldValue + newValue) / newStock : item.price;

      await product.save({ session });

      // Update HPP dish sesuai product
      await updateDishHPP(product._id, session);

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

    // Simpan payment
    await savePaymentFromPurchase(
      "Purchase",
      savedPurchase._id,
      grandTotal,
      "Cash",
      "Out",
      req.user?._id,
      session
    );

    await session.commitTransaction();
    res.status(201).json({
      success: true,
      message: "Purchase & Payment berhasil dibuat",
      data: savedPurchase,
    });
  } catch (error) {
    if (session.inTransaction()) await session.abortTransaction();
    res.status(400).json({ success: false, message: error.message });
  } finally {
    session.endSession();
  }
};

// ================= UPDATE PURCHASE =================
exports.updatePurchase = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const { id } = req.params;
    const { supplier, items } = req.body;

    const oldPurchase = await Purchase.findById(id).session(session);
    if (!oldPurchase) return res.status(404).json({ success: false, message: "Purchase not found" });

    // Rollback stock lama
    for (const oldItem of oldPurchase.items) {
      const product = await Product.findById(oldItem.product).session(session);
      if (!product) continue;

      const { qtyBase } = await getBaseUnitAndQty(oldItem.unit, oldItem.quantity, session);
      product.stockBase -= qtyBase;
      await product.save({ session });

      await updateDishHPP(product._id, session);

      await StockTransaction.create(
        [
          {
            product: product._id,
            type: "OUT",
            qty: oldItem.quantity,
            unit: oldItem.unit,
            qtyBase,
            note: "Rollback Purchase Update",
          },
        ],
        { session }
      );
    }

    const grandTotal = items.reduce((sum, item) => sum + (item.total || 0), 0);

    const updated = await Purchase.findByIdAndUpdate(
      id,
      { supplier, items, grandTotal },
      { new: true, session }
    );

    // Update stock & HPP baru
    for (const item of items) {
      const product = await Product.findById(item.product).session(session);
      if (!product) continue;

      const { unitBase, qtyBase } = await getBaseUnitAndQty(item.unit, item.quantity, session);

      const oldStock = product.stockBase || 0;
      const oldValue = oldStock * (product.hpp || 0);
      const newValue = qtyBase * item.price;
      const newStock = oldStock + qtyBase;

      product.stockBase = newStock;
      product.hpp = newStock > 0 ? (oldValue + newValue) / newStock : item.price;

      await product.save({ session });
      await updateDishHPP(product._id, session);

      await StockTransaction.create(
        [
          {
            product: product._id,
            type: "IN",
            qty: item.quantity,
            unit: item.unit,
            unitBase,
            qtyBase,
            note: "Purchase Update",
          },
        ],
        { session }
      );
    }

    // Update payment
    await Payment.updateMany(
      { source: id, sourceType: "Purchase" },
      { $set: { amount: grandTotal } },
      { session }
    );

    await session.commitTransaction();
    res.json({ success: true, data: updated });
  } catch (error) {
    if (session.inTransaction()) await session.abortTransaction();
    res.status(400).json({ success: false, message: error.message });
  } finally {
    session.endSession();
  }
};

// ================= DELETE PURCHASE =================
exports.deletePurchase = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const { id } = req.params;
    const purchase = await Purchase.findById(id).session(session);
    if (!purchase) return res.status(404).json({ success: false, message: "Purchase not found" });

    for (const item of purchase.items) {
      const product = await Product.findById(item.product).session(session);
      if (!product) continue;

      const { qtyBase } = await getBaseUnitAndQty(item.unit, item.quantity, session);
      product.stockBase -= qtyBase;
      await product.save({ session });

      await updateDishHPP(product._id, session);

      await StockTransaction.create(
        [
          {
            product: product._id,
            type: "OUT",
            qty: item.quantity,
            unit: item.unit,
            qtyBase,
            note: "Purchase Deleted",
          },
        ],
        { session }
      );
    }

    await Purchase.deleteOne({ _id: id }, { session });
    await Payment.deleteMany({ source: id, sourceType: "Purchase" }, { session });

    await session.commitTransaction();
    res.json({ success: true, message: "Purchase deleted successfully" });
  } catch (error) {
    if (session.inTransaction()) await session.abortTransaction();
    res.status(500).json({ success: false, message: error.message });
  } finally {
    session.endSession();
  }
};
