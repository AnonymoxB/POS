const Supplier = require("../models/supplierModel");

// GET all suppliers
exports.getSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find().sort({ createdAt: -1 });
    res.json({ success: true, data: suppliers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// CREATE supplier
exports.createSupplier = async (req, res) => {
  try {
    const supplier = new Supplier(req.body);
    await supplier.save();
    res.json({ success: true, data: supplier });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// UPDATE supplier
exports.updateSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!supplier) {
      return res
        .status(404)
        .json({ success: false, message: "Supplier not found" });
    }
    res.json({ success: true, data: supplier });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// DELETE supplier
exports.deleteSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndDelete(req.params.id);
    if (!supplier) {
      return res
        .status(404)
        .json({ success: false, message: "Supplier not found" });
    }
    res.json({ success: true, message: "Supplier deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
