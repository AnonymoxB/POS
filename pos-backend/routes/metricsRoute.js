const express = require("express");
const { getDashboardData } = require("../controllers/metricsController");
const router = express.Router();

router.get("/", getDashboardData);

module.exports = router;
