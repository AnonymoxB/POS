const express = require("express");
const { getMetrics } = require("../controllers/metricsController");
const router = express.Router();

// GET /api/metrics
router.get("/", getMetrics);

module.exports = router;
