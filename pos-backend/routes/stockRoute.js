const express = require("express");
const router = express.Router();
const controller = require("../controllers/stockTransactionController");

router.get("/", controller.getStockTransactions);
router.get("/:id", controller.getStockTransactionById);
router.post("/", controller.createStockTransaction);
router.delete("/:id", controller.deleteStockTransaction);

//Summary stok per product
router.get("/summary/all", controller.getStockSummary);
router.get("/summary/:productId", controller.getStockSummaryByProduct);
router.get("/history/:productId", controller.getStockHistoryByProduct);
router.get("/summary", controller.getAllStockSummary);




module.exports = router;
