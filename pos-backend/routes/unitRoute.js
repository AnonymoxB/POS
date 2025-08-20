const express = require("express");
const {
  createUnit,
  getUnits,
  getUnitById,
  updateUnit,
  deleteUnit,
} = require("../controllers/unitController");

const router = express.Router();

router.post("/", createUnit);
router.get("/", getUnits);
router.get("/:id", getUnitById);
router.put("/:id", updateUnit);
router.delete("/:id", deleteUnit);

module.exports = router;
