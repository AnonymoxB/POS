const express = require("express");
const router = express.Router();
const {
  createCashPayment,
  getAllPayments
} = require("../controllers/paymentController");



// 🔥 Rute untuk pembayaran cash
router.post("/cash", createCashPayment);
router.get("/", getAllPayments);

module.exports = router;
