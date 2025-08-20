const mongoose = require("mongoose");

const unitSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    short: { type: String, required: true },
    baseUnit: { type: mongoose.Schema.Types.ObjectId, ref: "Unit", default: null },
    conversion: { type: Number, default: 1 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Unit", unitSchema);
