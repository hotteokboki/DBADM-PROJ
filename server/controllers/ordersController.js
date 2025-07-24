const { getUserOrders, getAllOrders } = require("../models/ordersModel");

const fetchUserOrders = async (req, res) => {
  try {
    const user_id = req.session?.user?.id;
    const result = await getUserOrders(user_id);

    res.status(200).json({
      success: true,
      orders: result.orders,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
};

const fetchAllOrders = async (req, res) => {
  try {
    const result = await getAllOrders();

    res.status(200).json({
      success: true,
      orders: result.orders,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
};

module.exports = { fetchUserOrders, fetchAllOrders }