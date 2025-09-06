const Dish = require("../models/dishesModel");
const DishBOM = require("../models/dishBOMModel");
const Product = require("../models/productModel");
const Unit = require("../models/unitModel");

// GET all dishes
const getAllDishes = async (req, res) => {
  try {
    const dishes = await Dish.find().populate("category", "name").sort({ createdAt: -1 });
    res.json({ data: dishes });
  } catch (error) {
    res.status(500).json({ message: "Gagal mengambil data hidangan", error });
  }
};



// POST create a new dish
const createDish = async (req, res) => {
  try {
    const { name, price, hpp, category } = req.body;
    const newDish = new Dish({ name, price, hpp, category });
    await newDish.save();

    const populatedDish = await Dish.findById(newDish._id)
      .populate("category", "name");
      
    return res.status(201).json({
      success: true,
      message: "Menu berhasil ditambahkan",
      data: newDish,
    });

  } catch (error) {
    return res
      .status(400)
      .json({ success: false, message: error.message });
  }
};


// PUT update dish
const updateDish = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedDish = await Dish.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedDish) {
      return res.status(404).json({ message: "Hidangan tidak ditemukan" });
    }
    res.json({ message: "Hidangan berhasil diperbarui", data: updatedDish });
  } catch (error) {
    res.status(500).json({ message: "Gagal memperbarui hidangan", error });
  }
};

// DELETE dish
const deleteDish = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedDish = await Dish.findByIdAndDelete(id);
    if (!deletedDish) {
      return res.status(404).json({ message: "Hidangan tidak ditemukan" });
    }
    res.json({ message: "Hidangan berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ message: "Gagal menghapus hidangan", error });
  }
};


// Endpoint khusus untuk hitung HPP dish
const getDishHPP = async (req, res) => {
  try {
    const { id } = req.params;
    const dish = await calculateDishHPP(id);
    if (!dish) {
      return res.status(404).json({ success: false, message: "Dish tidak ditemukan" });
    }
    res.json({ success: true, data: dish });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET dish by id (termasuk BOM + product + unit)
const getDishById = async (req, res) => {
  try {
    const { id } = req.params;

    
    const dish = await Dish.findById(id).populate("category", "name");
    if (!dish) {
      return res.status(404).json({ success: false, message: "Dish tidak ditemukan" });
    }

    
    const bom = await DishBOM.find({ dish: id })
      .populate({
        path: "product",
        select: "name price defaultUnit",
        populate: { path: "defaultUnit", select: "name short" },
      })
      .populate("unit", "name short");

    return res.json({
      success: true,
      data: { ...dish.toObject(), bom },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};





module.exports = {
  getAllDishes,
  createDish,
  updateDish,
  deleteDish,
  getDishHPP,
  getDishById,
};
