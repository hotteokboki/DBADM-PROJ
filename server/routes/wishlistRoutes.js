const express = require("express");
const { addWishlistItem, removeWishlistItem, fetchWishlist, fetchWishlistItem } = require("../controllers/wishlistController");
const router = express.Router();

router.post("/add", addWishlistItem);
router.delete("/remove", removeWishlistItem);
router.get("/get-wishlist", fetchWishlist);
router.get("/:id", fetchWishlistItem);

module.exports = router;