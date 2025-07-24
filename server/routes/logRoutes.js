const express = require("express");
const { fetchProductLogs, fetchSessionLogs } = require("../controllers/logController");
const router = express.Router();

router.get("/get-product-logs", fetchProductLogs); 
router.get("/get-session-logs", fetchSessionLogs); 

module.exports = router;