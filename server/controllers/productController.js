const { insertProductQuery, getProductsWithoutDiscount } = require("../models/productModel");

const insertProduct = async (req, res) => {
  try {
    const productData = req.body;

    console.log("Checking product data: ", productData)

    await insertProductQuery(productData);

    res.status(201).json({
      success: true,
      message: "Product inserted successfully",
    });
  } catch (error) {
    console.error("Error inserting product:", error);
    res.status(500).json({
      success: false,
      message: "Failed to insert product",
      error: error.message,
    });
  }
};

const fetchProductsWithoutDiscount = async (req, res) => {
  try {
    const result = await getProductsWithoutDiscount();

    res.status(200).json({
      success: true,
      products: result.products,
    });
  } catch (error) {
    console.error("Error fetching products without discount:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch products without discount",
      error: error.message,
    });
  }
};

module.exports = { insertProduct, fetchProductsWithoutDiscount };
