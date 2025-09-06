const DishBOM = require("../models/dishBOMModel");
const Dish = require("../models/dishesModel");

// Hitung ulang HPP
const calculateDishHPP = async (dishId) => {
  const bomItems = await DishBOM.find({ dish: dishId }).populate("product");

  let totalHot = 0;
  let totalIce = 0;

  for (const item of bomItems) {
    if (!item.product) continue;
    const productHPP = Number(item.product.hpp) || 0;
    const qtyBase = Number(item.qtyBase) || 0;

    if (item.variant === "hot") totalHot += productHPP * qtyBase;
    else if (item.variant === "ice") totalIce += productHPP * qtyBase;
  }

  return Dish.findByIdAndUpdate(
    dishId,
    { "hpp.hpphot": totalHot, "hpp.hppice": totalIce },
    { new: true }
  );
};

// ➕ Tambah BOM
exports.addBOMItem = async (req, res) => {
  try {
    const { product, qty, unit, variant } = req.body;
    const { dishId } = req.params;

    if (!dishId || !product || !qty || !unit || !variant) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    const newItem = await DishBOM.create({
      dish: dishId,
      product,
      qty,
      unit,
      variant,
    });

    await calculateDishHPP(dishId);

    res.status(201).json({ success: true, data: newItem });
  } catch (err) {
    console.error("🔥 addBOMItem Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// 📦 Ambil semua BOM per dish
exports.getBOMByDish = async (req, res) => {
  try {
    const { dishId } = req.params;
    const items = await DishBOM.find({ dish: dishId })
      .populate("product", "name hpp")
      .populate("unit", "name short")
      .populate("unitBase", "name short");

    const itemsWithHPP = items.map((item) => {
      const productHPP = Number(item.product?.hpp) || 0;
      const qtyBase = Number(item.qtyBase) || 0;
      return {
        ...item.toObject(),
        hpp: productHPP * qtyBase,
        qty: item.qtyBase,
      };
    });

    res.json({ success: true, data: itemsWithHPP });
  } catch (err) {
    console.error("🔥 getBOMByDish Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✏️ Update BOM
exports.updateBOMItem = async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await DishBOM.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: "BOM item not found" });
    }

    await calculateDishHPP(updated.dish);

    res.json({ success: true, data: updated });
  } catch (err) {
    console.error("🔥 updateBOMItem Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// 🗑️ Hapus BOM
exports.deleteBOMItem = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await DishBOM.findByIdAndDelete(id);
    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, message: "BOM item not found" });
    }

    await calculateDishHPP(deleted.dish);

    res.json({ success: true, message: "BOM item deleted" });
  } catch (err) {
    console.error("🔥 deleteBOMItem Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
