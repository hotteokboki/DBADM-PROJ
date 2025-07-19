const { insertProductQuery, getProductsWithoutDiscount, getProductList, getProductInformation } = require("../models/productModel");

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

const fetchProductList = async (req, res) => {
  try {
    const result = await getProductList();

    res.status(200).json({
      success: true,
      products: result.products,
    });
  } catch (error) {
    console.error("Error fetching product list:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch product list",
      error: error.message,
    });
  }
};

const fetchProductInformation = async (req, res) => {
  try {
    const product_id = req.params.id;
    
    const result = await getProductInformation(product_id);

    res.status(200).json({
      success: true,
      products: result.products,
    });
  } catch (error) {
    console.error("Error fetching product information:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch product information",
      error: error.message,
    });
  }
};

module.exports = { insertProduct, fetchProductsWithoutDiscount, fetchProductList, fetchProductInformation };
