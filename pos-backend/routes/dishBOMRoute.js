const express = require("express");
const router = express.Router();
const {
  addBOMItem,
  getBOMByDish,
  updateBOMItem,
  deleteBOMItem,
} = require("../controllers/dishBOMController");

router.post("/", addBOMItem);
router.get("/:dishId", getBOMByDish);
router.put("/:id", updateBOMItem);    
router.delete("/:id", deleteBOMItem);  

module.exports = router;
