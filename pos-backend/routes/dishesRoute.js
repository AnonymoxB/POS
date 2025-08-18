const express = require("express");
const router = express.Router();
const {
  getAllDishes,
  createDish,
  updateDish,
  deleteDish,
} = require("../controllers/dishesController");




router.get("/", getAllDishes);      // GET /api/dish
router.post("/", createDish);       // POST /api/dish
router.put("/:id", updateDish);     // PUT /api/dish/:id 
router.delete("/:id", deleteDish);  // DELETE /api/dish/:id 

module.exports = router;
