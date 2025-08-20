import Unit from "../models/unitModels.js";

// Create unit
export const createUnit = async (req, res) => {
  try {
    const unit = new Unit(req.body);
    await unit.save();
    res.status(201).json(unit);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Get all units
export const getUnits = async (req, res) => {
  try {
    const units = await Unit.find().populate("baseUnit");
    res.json(units);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get single unit
export const getUnitById = async (req, res) => {
  try {
    const unit = await Unit.findById(req.params.id).populate("baseUnit");
    if (!unit) return res.status(404).json({ message: "Unit not found" });
    res.json(unit);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update unit
export const updateUnit = async (req, res) => {
  try {
    const unit = await Unit.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!unit) return res.status(404).json({ message: "Unit not found" });
    res.json(unit);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete unit
export const deleteUnit = async (req, res) => {
  try {
    const unit = await Unit.findByIdAndDelete(req.params.id);
    if (!unit) return res.status(404).json({ message: "Unit not found" });
    res.json({ message: "Unit deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
