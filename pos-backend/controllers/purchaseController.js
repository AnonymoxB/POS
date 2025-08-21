const Purchase = require("../models/purchaseModel");
const Product = require("../models/productModel"); // jangan lupa import Product

// Create Purchase
exports.createPurchase = async (req, res) => {
  try {
    const { supplier, items } = req.body;

    // Hitung grand total
    const grandTotal = items.reduce((sum, item) => sum + item.total, 0);

    const purchase = await Purchase.create({
      supplier,
      items,
      grandTotal,
    });

    // Tambah stok ke product
    for (const item of items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity },
      });
    }

    res.status(201).json({ success: true, data: purchase });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get All Purchases
exports.getPurchases = async (req, res) => {
  try {
    const purchases = await Purchase.find()
      .populate("items.product", "name stock") // tampilkan juga stok
      .populate("items.unit", "name short");

    res.json({ success: true, data: purchases });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Purchase
exports.updatePurchase = async (req, res) => {
  try {
    const { id } = req.params;
    const { supplier, items } = req.body;

    // Cari purchase lama
    const oldPurchase = await Purchase.findById(id);
    if (!oldPurchase) {
      return res
        .status(404)
        .json({ success: false, message: "Purchase not found" });
    }

    // Balikin stok lama
    for (const oldItem of oldPurchase.items) {
      await Product.findByIdAndUpdate(oldItem.product, {
        $inc: { stock: -oldItem.quantity },
      });
    }

    // Hitung grand total baru
    const grandTotal = items.reduce((sum, item) => sum + item.total, 0);

    // Update purchase
    const updated = await Purchase.findByIdAndUpdate(
      id,
      { supplier, items, grandTotal },
      { new: true }
    );

    // Tambah stok baru
    for (const item of items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity },
      });
    }

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete Purchase
exports.deletePurchase = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Purchase.findByIdAndDelete(id);

    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, message: "Purchase not found" });
    }

    // Balikin stok saat purchase dihapus
    for (const item of deleted.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity },
      });
    }

    res.json({ success: true, message: "Purchase deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Single Purchase
exports.getPurchaseById = async (req, res) => {
    try {
      const { id } = req.params;
      const purchase = await Purchase.findById(id)
        .populate("items.product", "name stock")
        .populate("items.unit", "name short");
  
      if (!purchase) {
        return res.status(404).json({ success: false, message: "Purchase not found" });
      }
  
      res.json({ success: true, data: purchase });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  };
  
