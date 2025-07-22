const { addToCart, getCartItems, removeCartItem } = require("../models/cartModel");

const addToCartController = async (req, res) => {
  const { productId, quantity, priceAtAddition } = req.body;
  const userId = req.session?.user?.id;

  if (!userId || !productId || !quantity || !priceAtAddition) {
    return res.status(400).json({
      success: false,
      message: "userId, productId, quantity, and priceAtAddition are all required.",
    });
  }

  try {
    const result = await addToCart({ userId, productId, quantity, priceAtAddition });

    res.status(200).json({
      success: true,
      message: "Item successfully added to cart.",
      cartId: result.cartId,
    });
  } catch (error) {
    console.error("Error adding item to cart:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add item to cart.",
      error: error.message,
    });
  }
};

const fetchCartItems = async (req, res) => {
  const userId = req.session?.user?.id;

  console.log(userId);

  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  try {
    const cartItems = await getCartItems(userId);
    res.status(200).json({ success: true, cartItems });
  } catch (err) {
    console.error("Fetch cart error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const removeItemFromCart = async (req, res) => {
  const userId = req.session?.user?.id;
  const { productId } = req.body;

  if (!userId || !productId) {
    return res.status(400).json({
      success: false,
      message: "Missing user or product ID",
    });
  }

  try {
    const result = await removeCartItem(userId, productId);
    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error("Cart remove error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to remove item from cart",
      error: error.message,
    });
  }
};

module.exports = { addToCartController, fetchCartItems, removeItemFromCart };
