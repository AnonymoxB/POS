const ProductCategory = require("../models/productCategoryModel");

exports.getProductCategories = async (req, res) => {
  try {
    const categories = await ProductCategory.find().sort({ createdAt: -1 });
    res.json({ success: true, data: categories });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createProductCategory = async (req, res) => {
  try {
    const category = new ProductCategory(req.body);
    await category.save();
    res.status(201).json({ success: true, data: category });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.updateProductCategory = async (req, res) => {
  try {
    const category = await ProductCategory.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!category) {
      return res.status(404).json({ success: false, message: "Not found" });
    }
    res.json({ success: true, data: category });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.deleteProductCategory = async (req, res) => {
  try {
    const category = await ProductCategory.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: "Not found" });
    }
    res.json({ success: true, message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
