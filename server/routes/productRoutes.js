const express = require("express");
const { insertProduct, fetchProductsWithoutDiscount, fetchProductList, fetchProductInformation, getAllProducts, setProductInactiveController, updateProductInformation } = require("../controllers/productController");
const router = express.Router();

router.post("/insert-products", insertProduct); 
router.get("/get-all-products-without-discount", fetchProductsWithoutDiscount);
router.get("/get-product-list", fetchProductList);
router.get("/product-information/:id", fetchProductInformation);
router.get("/get-all", getAllProducts);
router.patch("/set-inactive/:productId", setProductInactiveController);
router.put("/update/:productId", updateProductInformation)

module.exports = router;
