const express = require("express");
const { insertProduct, fetchProductsWithoutDiscount } = require("../controllers/productController");
const router = express.Router();

router.post("/insert-products", insertProduct); 
router.get("/get-all-products-without-discount", fetchProductsWithoutDiscount)

module.exports = router;
