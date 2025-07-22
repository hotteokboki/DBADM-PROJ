const express = require("express");
const router = express.Router();
const checkoutController = require("../controllers/checkoutController");

// POST /checkout
router.post("/", checkoutController.checkout);
router.get('/currencies', checkoutController.getAvailableCurrencies);
// Add this route alongside your existing checkout routes
router.get('/exchange-rates', checkoutController.getExchangeRates);

module.exports = router;
