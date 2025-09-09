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
      product.hpp = newStock > 0 
      ? Math.round((oldValue + newValue) / newStock) 
      : Math.round(item.price);

      product.lastPurchasePrice = item.price;

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

    // ✅ Validasi awal
    if (!items || items.length === 0) {
      throw new Error("Items tidak boleh kosong");
    }
    for (const item of items) {
      if (!item.product || !item.unit || item.quantity == null || item.price == null) {
        throw new Error("Item harus punya product, unit, quantity, dan price");
      }
    }

    const oldPurchase = await Purchase.findById(id).session(session);
    if (!oldPurchase)
      return res.status(404).json({ success: false, message: "Purchase not found" });

    // ✅ Rollback stock lama
    for (const oldItem of oldPurchase.items) {
      const product = await Product.findById(oldItem.product).session(session);
      if (!product) continue;

      const { unitBase, qtyBase } = await getBaseUnitAndQty(
        oldItem.unit,
        oldItem.quantity,
        session
      );

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
            unitBase,
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

    // ✅ Update stock & HPP baru
    for (const item of items) {
      const product = await Product.findById(item.product).session(session);
      if (!product) continue;

      const { unitBase, qtyBase } = await getBaseUnitAndQty(
        item.unit,
        item.quantity,
        session
      );

      const oldStock = product.stockBase || 0;
      const oldValue = oldStock * (product.hpp || 0);
      const newValue = qtyBase * item.price;
      const newStock = oldStock + qtyBase;

      product.stockBase = newStock;
      product.hpp = newStock > 0 
      ? Math.round((oldValue + newValue) / newStock) 
      : Math.round(item.price);

      product.lastPurchasePrice = item.price; // ✅ update harga beli terakhir

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

    // ✅ Update payment
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
    if (!purchase) {
      return res.status(404).json({ success: false, message: "Purchase not found" });
    }

    // Rollback stock per item
    for (const item of purchase.items) {
      try {
        const product = await Product.findById(item.product).session(session);
        if (!product) {
          console.warn(`Product ${item.product} tidak ditemukan, skip rollback`);
          continue;
        }

        // Hitung qty base & unit base
        const { unitBase, qtyBase } = await getBaseUnitAndQty(item.unit, item.quantity, session);
        if (!unitBase || !qtyBase || qtyBase <= 0) {
          console.warn(`qtyBase/unitBase invalid untuk produk ${product.name}, skip rollback`);
          continue;
        }

        // Update stock, jangan sampai negatif
        product.stockBase = Math.max(0, product.stockBase - qtyBase);
        await product.save({ session });

        // Update HPP dish terkait, try/catch per product
        try {
          await updateDishHPP(product._id, session);
        } catch (errHPP) {
          console.error(`Gagal update HPP untuk produk ${product.name}:`, errHPP.message);
        }

        // Simpan transaksi stok
        await StockTransaction.create(
          [
            {
              product: product._id,
              type: "OUT",
              qty: item.quantity,
              unit: item.unit,
              unitBase,
              qtyBase,
              note: "Purchase Deleted",
            },
          ],
          { session }
        );
      } catch (errItem) {
        console.error(`Gagal rollback item ${item._id}:`, errItem.message);
        // jangan throw, biar item lain tetap jalan
      }
    }

    // Hapus purchase & payment
    await Purchase.deleteOne({ _id: id }, { session });
    await Payment.deleteMany({ source: id, sourceType: "Purchase" }, { session });

    await session.commitTransaction();
    res.json({ success: true, message: "Purchase deleted successfully" });
  } catch (error) {
    if (session.inTransaction()) await session.abortTransaction();
    console.error("DELETE PURCHASE ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    session.endSession();
  }
};


