const DishBOM = require("../models/dishBOMModel");
const Dish = require("../models/dishesModel");
const Product = require("../models/productModel");

// Tambah BOM untuk dish
exports.addBOMItem = async (req, res) => {
    try {
      const { product, qty, unit } = req.body;
      const { dishId } = req.params;
  
      if (!dishId || !product || !qty || !unit || !variant) {
        return res.status(400).json({ success: false, message: "All fields are required" });
      }
  
      const newItem = await DishBOM.create({ dish: dishId, product, qty, unit, variant });
      res.status(201).json({ success: true, data: newItem });
    } catch (err) {
      console.error("🔥 addBOMItem Error:", err);
      res.status(500).json({ success: false, message: err.message });
    }
  };
  

// Ambil semua BOM untuk dish tertentu
exports.getBOMByDish = async (req, res) => {
  try {
    const { dishId } = req.params;
    const items = await DishBOM.find({ dish: dishId })
      .populate("product", "name")
      .populate("unit", "short");

    res.json({ success: true, data: items });
  } catch (err) {
    console.error("🔥 getBOMByDish Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update item BOM
exports.updateBOMItem = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await DishBOM.findByIdAndUpdate(id, req.body, { new: true });

    if (!updated) return res.status(404).json({ success: false, message: "BOM item not found" });

    res.json({ success: true, data: updated });
  } catch (err) {
    console.error("🔥 updateBOMItem Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Hapus item BOM
exports.deleteBOMItem = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await DishBOM.findByIdAndDelete(id);

    if (!deleted) return res.status(404).json({ success: false, message: "BOM item not found" });

    res.json({ success: true, message: "BOM item deleted" });
  } catch (err) {
    console.error("🔥 deleteBOMItem Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
