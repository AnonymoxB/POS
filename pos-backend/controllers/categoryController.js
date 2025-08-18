const Category = require("../models/categoryModel"); 


// GET all categories
exports.getAllCategory = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.json({ data: categories });
  } catch (error) {
    res.status(500).json({ message: "Gagal mengambil data hidangan", error });
  }
};

// POST /api/category
exports.createCategory = async (req, res) => {
  try {
    const { name, bgColor, icon } = req.body;

    if (!name || !icon) {
      return res.status(400).json({ message: "Semua field wajib diisi" });
    }

    const newCategory = new Category({
      name,
      icon,
    });

    await newCategory.save();

    res.status(201).json({
      message: "Kategori berhasil ditambahkan",
      category: newCategory,
    });
  } catch (error) {
    res.status(500).json({ message: "Gagal menambahkan kategori", error });
  }
};

// delete
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedCategory = await Category.findByIdAndDelete(id);

    if (!deletedCategory) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//update
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      { name: req.body.name },
      { new: true }
    );

    if (!updatedCategory) {
      return res.status(404).json({ message: "Kategori tidak ditemukan" });
    }

    res.status(200).json(updatedCategory);
  } catch (error) {
    res.status(500).json({ message: "Gagal mengupdate kategori", error: error.message });
  }
};

