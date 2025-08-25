const express = require("express");
const router = express.Router();
const controller = require("../controllers/expenseController");

router.get("/", controller.getExpenses);
router.get("/:id", controller.getExpenseById);
router.post("/", controller.createExpense);
router.put("/:id", controller.updateExpense);
router.delete("/:id", controller.deleteExpense);
router.get("/export", controller.exportExpenses);


module.exports = router;
