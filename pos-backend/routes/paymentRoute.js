const express = require("express");
const router = express.Router();
const {
  getAllPayments,
  createPayment,
  getPaymentById,
  updatePayment,
  deletePayment,
  getPaymentsSummary,
  deleteMultiplePayments
} = require("../controllers/paymentController");

// CRUD Payment
router.get("/", getAllPayments);
router.post("/", createPayment);
router.get("/:id", getPaymentById);
router.put("/:id", updatePayment);
router.delete("/:id", deletePayment);
router.get("/summary/all", getPaymentsSummary);
router.delete("/bulk", deleteMultiplePayments);


module.exports = router;
