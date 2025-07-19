const { getAllDiscounts, createDiscountQuery, tagProductsWithDiscount } = require("../models/discountsModel");

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

const tagProducts = async (req, res) => {
  const { discount_id, product_ids } = req.body;

  if (!discount_id || !Array.isArray(product_ids) || product_ids.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Discount ID and non-empty product_ids array are required.",
    });
  }

  try {
    await tagProductsWithDiscount(product_ids, discount_id);

    res.status(200).json({
      success: true,
      message: "Products successfully tagged with the discount.",
    });
  } catch (error) {
    console.error("Error tagging products:", error);
    res.status(500).json({
      success: false,
      message: "Failed to tag products with discount.",
      error: error.message,
    });
  }
};

module.exports = { fetchDiscounts, createDiscount, tagProducts };