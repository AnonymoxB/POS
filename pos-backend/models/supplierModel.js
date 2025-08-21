const mongoose = require("mongoose");
const { Schema } = mongoose;

const supplierSchema = new Schema(
  {
    name: { type: String, required: true },
    phone: { type: String },
    address: { type: String }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Supplier", supplierSchema);
