const express = require("express");
const {
  addOrder,
  getOrderById,
  getOrders,
  updateOrder,
  getPopularDishes,
  getOrderMetrics,
  getProfitPerDish,
} = require("../controllers/orderController");
const { isVerifiedUser } = require("../middlewares/tokenVerification");

const router = express.Router();

router.get("/popular", isVerifiedUser, getPopularDishes);
router.get("/metrics", isVerifiedUser, getOrderMetrics);

router.route("/")
  .post(isVerifiedUser, addOrder)
  .get(isVerifiedUser, getOrders);

router.route("/:id")
  .get(isVerifiedUser, getOrderById)
  .put(isVerifiedUser, updateOrder);

router.get("/profit-per-dish", isVerifiedUser, getProfitPerDish);

module.exports = router;
