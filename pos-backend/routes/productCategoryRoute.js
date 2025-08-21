const express = require("express");
const router = express.Router();
const controller = require("../controllers/productCategoryController");

router.get("/", controller.getProductCategories);
router.post("/", controller.createProductCategory);
router.put("/:id", controller.updateProductCategory);
router.delete("/:id", controller.deleteProductCategory);

module.exports = router;
