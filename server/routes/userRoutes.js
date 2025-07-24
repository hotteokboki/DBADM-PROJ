const express = require("express");
const router = express.Router();
const { getUsers } = require("../controllers/userController");
const checkoutController = require("../controllers/checkoutController");

// Existing route
router.get("/get-users", getUsers); 

// ✅ NEW - Add the addresses route
router.get('/addresses', checkoutController.getUserAddresses);

module.exports = router;