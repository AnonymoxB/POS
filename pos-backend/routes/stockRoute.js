const express = require("express");
const router = express.Router();
const controller = require("../controllers/stockController");

// =====================
// Transactions CRUD
// =====================
router.get("/transactions", controller.getStockTransactions);
router.post("/transactions", controller.createStockTransaction);
router.get("/transactions/:id", controller.getStockTransactionById);
router.delete("/transactions/:id", controller.deleteStockTransaction);

// =====================
// Summary routes
// =====================
router.get("/summary/export/:productId", controller.exportStockSummaryByProduct);

// Semua produk
router.get("/summary", controller.getStockSummary);

// Per produk
router.get("/summary/:productId", controller.getStockSummaryByProduct);

//Adjustment
router.post("/adjustment", controller.createStockAdjustment);


// =====================
// History routes
// =====================
router.get("/history/export/:productId", controller.exportStockHistory);
router.get("/history/:productId", controller.getStockHistoryByProduct);

module.exports = router;
