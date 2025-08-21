const express = require("express");
const {
  createPurchase,
  getPurchases,
  updatePurchase,
  deletePurchase,
} = require("../controllers/purchaseController");

const router = express.Router();

router.post("/", createPurchase);
router.get("/", getPurchases);
router.put("/:id", updatePurchase);
router.delete("/:id", deletePurchase);

module.exports = router;
