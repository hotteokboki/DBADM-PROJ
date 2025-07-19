const express = require("express");
const { fetchDiscounts, createDiscount, tagProducts, } = require("../controllers/discountsController");
const router = express.Router();

router.get("/get-all-discounts", fetchDiscounts); 
router.post("/create", createDiscount);
router.post("/tag", tagProducts);

module.exports = router;
