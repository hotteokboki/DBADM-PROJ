const express = require("express");
const { addToCartController, fetchCartItems, removeItemFromCart } = require("../controllers/cartController");

const router = express.Router();

router.post("/add-to-cart", addToCartController);
router.get("/get-cart-items", fetchCartItems);
router.post("/remove-item", removeItemFromCart)

module.exports = router;
