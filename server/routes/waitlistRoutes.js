const express = require("express");
const { joinWaitlistController, getWaitlistStatus } = require("../controllers/waitlistController");
const router = express.Router();

// Existing route
router.post("/join", joinWaitlistController); 
router.get("/status/:productId", getWaitlistStatus); 

module.exports = router;