const express = require("express");
const router = express.Router();
const {
  getAllDishes,
  createDish,
  updateDish,
  deleteDish,
} = require("../controllers/dishesController");




router.get("/", getAllDishes);
router.post("/", createDish);
router.put("/:id", updateDish);
router.delete("/:id", deleteDish);

module.exports = router;
