const express = require("express");
const router = express.Router();
const {
  getAllDishes,
  createDish,
  updateDish,
  deleteDish,
  getDishHPP
} = require("../controllers/dishesController");




router.get("/", getAllDishes);
router.post("/", createDish);
router.put("/:id", updateDish);
router.delete("/:id", deleteDish);
router.get("/:id/hpp", getDishHPP)

module.exports = router;
