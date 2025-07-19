const express = require("express");
const { insertProduct, fetchProductsWithoutDiscount, fetchProductList, fetchProductInformation } = require("../controllers/productController");
const router = express.Router();

router.post("/insert-products", insertProduct); 
router.get("/get-all-products-without-discount", fetchProductsWithoutDiscount)
router.get("/get-product-list", fetchProductList)
router.get("/product-information/:id", fetchProductInformation);

module.exports = router;
