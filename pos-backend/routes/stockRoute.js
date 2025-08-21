const express = require("express");
const router = express.Router();
const controller = require("../controllers/stockController");

router.get("/", controller.getStockTransactions);

// Summary routes
router.get("/summary/all", controller.getStockSummary);
router.get("/summary/export", controller.exportStockSummary);
router.get("/summary/:productId", controller.getStockSummaryByProduct);
router.get("/summary", controller.getAllStockSummary);

// History routes
router.get("/history/:productId", controller.getStockHistoryByProduct);

// CRUD utama
router.get("/", controller.getStockTransactions);
router.post("/", controller.createStockTransaction);

// Route detail by id
router.get("/:id", controller.getStockTransactionById);
router.delete("/:id", controller.deleteStockTransaction);





module.exports = router;
