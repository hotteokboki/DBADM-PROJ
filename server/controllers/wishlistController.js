const { addToWishlist, removeFromWishlist, getWishlistByUser, getWishlistByProductID } = require("../models/wishlistModel");


const addWishlistItem = async (req, res) => {
  const { productId } = req.body;
  const userId = req.session?.user?.id;

  try {
    await addToWishlist(userId, productId);
    res.status(200).json({ success: true, message: "Added to wishlist" });
  } catch (error) {
    console.error("Add to wishlist error:", error);
    res.status(500).json({ success: false, message: "Failed to add to wishlist" });
  }
};

const removeWishlistItem = async (req, res) => {
  const { productId } = req.params;
  const userId = req.session?.user?.id;

  try {
    await removeFromWishlist(userId, productId);
    res.status(200).json({ success: true, message: "Removed from wishlist" });
  } catch (error) {
    console.error("Remove from wishlist error:", error);
    res.status(500).json({ success: false, message: "Failed to remove from wishlist" });
  }
};

const fetchWishlist = async (req, res) => {
  const userId = req.session?.user?.id;

  try {
    const items = await getWishlistByUser(userId);
    res.status(200).json({ success: true, wishlist: items });
  } catch (error) {
    console.error("Fetch wishlist error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch wishlist" });
  }
};

const fetchWishlistItem = async (req, res) => {
  const { id } = req.params;

  try {
    const items = await getWishlistByProductID(id);
    res.status(200).json({ success: true, wishlist: items });
  } catch (error) {
    console.error("Fetch wishlist error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch wishlist" });
  }
};

module.exports = {
  addWishlistItem,
  removeWishlistItem,
  fetchWishlist,
  fetchWishlistItem
};
