const express = require("express");
const router = express.Router();
const {
  createPurchase,
  getPurchases,
  updatePurchase,
  deletePurchase,
} = require("../controllers/purchaseController");


router.post("/", createPurchase);
router.get("/", getPurchases);
router.put("/:id", updatePurchase);
router.delete("/:id", deletePurchase);  

module.exports = router;
