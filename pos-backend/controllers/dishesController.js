const Dish = require("../models/dishesModel");
const DishBOM = require("../models/dishBOMModel");
const Product = require("../models/productModel");

// GET all dishes
const getAllDishes = async (req, res) => {
  try {
    const dishes = await Dish.find().sort({ createdAt: -1 });
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
    res.status(201).json({ message: "Hidangan berhasil ditambahkan", data: newDish });
  } catch (error) {
    res.status(500).json({ message: "Gagal menambahkan hidangan", error });
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

const calculateDishHPP = async (dishId) => {
  const bomItems = await DishBOM.find({ dish: dishId }).populate("product");

  let totalHot = 0;
  let totalIce = 0;

  bomItems.forEach((item) => {
    const productHPP = item.product.price || 0;
    if (item.variant === "hot") {
      totalHot += productHPP * item.qty;
    } else if (item.variant === "ice") {
      totalIce += productHPP * item.qty;
    }
  });

  // update dish sesuai hasil per variant
  const updatedDish = await Dish.findByIdAndUpdate(
    dishId,
    {
      "hpp.hpphot": totalHot,
      "hpp.hppice": totalIce,
    },
    { new: true }
  );

  return updatedDish;
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




module.exports = {
  getAllDishes,
  createDish,
  updateDish,
  deleteDish,
  getDishHPP
};
