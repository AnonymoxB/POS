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
// Semua produk
router.get("/summary", controller.getStockSummary);
router.get("/summary/export", controller.exportStockSummary);

// Per produk
router.get("/summary/:productId", controller.getStockSummaryByProduct);
router.get("/summary/export/:productId", controller.exportStockSummaryByProduct);

// =====================
// History routes
// =====================
router.get("/history/:productId", controller.getStockHistoryByProduct);
router.get("/history/export/:productId", controller.exportStockHistory);


router.get("/summary/export", controller.exportStockSummary);


module.exports = router;
