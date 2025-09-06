const express = require("express");
const router = express.Router();
const {
  addBOMItem,
  getBOMByDish,
  updateBOMItem,
  deleteBOMItem,
} = require("../controllers/dishBOMController");

// BOM untuk 1 dish
router.get("/dish/:dishId", getBOMByDish);     // GET semua BOM item by dish
router.post("/dish/:dishId", addBOMItem);      // POST tambah BOM item ke dish

// Operasi langsung ke BOM item
router.put("/:id", updateBOMItem);             // PUT update 1 BOM item
router.delete("/:id", deleteBOMItem);          // DELETE hapus 1 BOM item

module.exports = router;
