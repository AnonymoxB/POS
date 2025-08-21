import express from "express";
import Purchase from "../models/purchaseModel.js";

const router = express.Router();

// Create Purchase
router.post("/", async (req, res) => {
  try {
    const { supplier, items } = req.body;

    // hitung total
    const grandTotal = items.reduce((sum, item) => sum + item.total, 0);

    const purchase = await Purchase.create({
      supplier,
      items,
      grandTotal,
    });

    res.status(201).json({ success: true, data: purchase });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Get all purchases
router.get("/", async (req, res) => {
  try {
    const purchases = await Purchase.find()
      .populate("items.product", "name")
      .populate("items.unit", "name short");
    res.json({ success: true, data: purchases });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
