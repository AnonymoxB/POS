const DishBOM = require("../models/dishBOMModel");
const Dish = require("../models/dishesModel");
const Unit = require("../models/unitModel");

// Fungsi rekursif untuk dapatkan root unit dan qty
async function getBaseUnitAndQty(unitId, qty, session = null) {
  const unitDoc = await Unit.findById(unitId).session(session);
  if (!unitDoc) return { unitBase: unitId, qtyBase: qty };

  if (!unitDoc.baseUnit) {
    return {
      unitBase: unitDoc._id,
      qtyBase: qty * (unitDoc.conversion || 1),
    };
  }

  return await getBaseUnitAndQty(
    unitDoc.baseUnit,
    qty * (unitDoc.conversion || 1),
    session
  );
}

// Hitung HPP dish otomatis
const calculateDishHPP = async (dishId) => {
  const bomItems = await DishBOM.find({ dish: dishId })
    .populate("product")
    .populate("unit");

  let totalHot = 0;
  let totalIce = 0;

  for (const item of bomItems) {
    if (!item.product || !item.unit) continue;

    const { qtyBase } = await getBaseUnitAndQty(item.unit._id, Number(item.qty) || 0);

    const productHPP = Number(item.product.hpp) || 0;

    if (item.variant === "hot") totalHot += productHPP * qtyBase;
    else if (item.variant === "ice") totalIce += productHPP * qtyBase;
  }

  return await Dish.findByIdAndUpdate(
    dishId,
    { "hpp.hpphot": totalHot, "hpp.hppice": totalIce },
    { new: true }
  );
};

// Tambah BOM item
exports.addBOMItem = async (req, res) => {
  try {
    const { product, qty, unit, variant } = req.body;
    const { dishId } = req.params;

    if (!dishId || !product || !qty || !unit || !variant) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const newItem = await DishBOM.create({ dish: dishId, product, qty, unit, variant });

    // Hitung ulang HPP otomatis
    await calculateDishHPP(dishId);

    res.status(201).json({ success: true, data: newItem });
  } catch (err) {
    console.error("🔥 addBOMItem Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Ambil semua BOM untuk dish
exports.getBOMByDish = async (req, res) => {
  try {
    const { dishId } = req.params;
    const items = await DishBOM.find({ dish: dishId })
      .populate("product", "name hpp")
      .populate("unit", "short conversion");

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
    await calculateDishHPP(updated.dish);
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
    await calculateDishHPP(deleted.dish);
    res.json({ success: true, message: "BOM item deleted" });
  } catch (err) {
    console.error("🔥 deleteBOMItem Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
