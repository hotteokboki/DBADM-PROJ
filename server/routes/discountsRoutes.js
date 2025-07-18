const express = require("express");
const { fetchDiscounts, createDiscount } = require("../controllers/discountsController");
const router = express.Router();

router.get("/get-all-discounts", fetchDiscounts); 
router.post("/create", createDiscount);

module.exports = router;
