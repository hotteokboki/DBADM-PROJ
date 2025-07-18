const express = require("express");
const { insertProduct } = require("../controllers/productController");
const router = express.Router();

router.post("/insert-products", insertProduct); 

module.exports = router;
