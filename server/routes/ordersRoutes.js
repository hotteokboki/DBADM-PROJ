const express = require("express");
const { fetchUserOrders, fetchAllOrders } = require("../controllers/ordersController");
const router = express.Router();

router.get("/get-user-orders", fetchUserOrders); 
router.get("/get-orders", fetchAllOrders); 

module.exports = router;