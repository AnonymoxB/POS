const express = require("express");
const {addOrder, getOrderById, getOrders, updateOrder} = require("../controllers/orderController");
const { getPopularDishes } = require('../controllers/orderController');
const { isVerifiedUser } = require("../middlewares/tokenVerification");
const router = express.Router();

router.get("/popular", isVerifiedUser, getPopularDishes);

router.route("/").post(isVerifiedUser, addOrder);
router.route("/").get(isVerifiedUser, getOrders);
router.route("/:id").get(isVerifiedUser, getOrderById);
router.route("/:id").put(isVerifiedUser, updateOrder);



module.exports = router;