const { getProductLogs } = require("../models/productlogModel");
const { getSessionLogs } = require("../models/sessionlogsModel");

const fetchProductLogs = async (req, res) => {
  try {
    const result = await getProductLogs();

    res.status(200).json({
      success: true,
      productlogs: result.productlogs,
    });
  } catch (error) {
    console.error("Error fetching product logs:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch product logs",
      error: error.message,
    });
  }
};

const fetchSessionLogs = async (req, res) => {
  try {
    const result = await getSessionLogs();

    res.status(200).json({
      success: true,
      sessionlogs: result.sessionlogs,
    });
  } catch (error) {
    console.error("Error fetching session logs:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch session logs",
      error: error.message,
    });
  }
};

module.exports = { fetchProductLogs, fetchSessionLogs }