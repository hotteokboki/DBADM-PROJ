const { getAllDiscounts, createDiscountQuery } = require("../models/discountsModel");

const fetchDiscounts = async (req, res) => {
  try {
    const result = await getAllDiscounts();

    res.status(200).json({
      success: true,
      discounts: result.discounts,
    });
  } catch (error) {
    console.error("Error fetching discounts:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch discounts",
      error: error.message,
    });
  }
};

const createDiscount = async (req, res) => {
  try {
    const discountData = req.body;

    await createDiscountQuery(discountData);

    res.status(201).json({
      success: true,
      message: "Discount created successfully",
    });
  } catch (error) {
    console.error("Error creating discount:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create discount",
      error: error.message,
    });
  }
};

module.exports = { fetchDiscounts, createDiscount };