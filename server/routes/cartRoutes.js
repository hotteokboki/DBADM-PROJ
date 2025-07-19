const express = require("express");
const { addToCartController, fetchCartItems } = require("../controllers/cartController");

const router = express.Router();

router.post("/add-to-cart", addToCartController);
router.get("/get-cart-items", fetchCartItems);

module.exports = router;
