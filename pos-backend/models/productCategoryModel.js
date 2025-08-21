const mongoose = require("mongoose");

const productCategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

mmodule.exports = mongoose.model(
  "ProductCategory",  
  productCategorySchema,
  "productcategories"     
);
