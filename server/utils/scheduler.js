// utils/scheduler.js
const cron = require("node-cron");
const { restorePrices } = require("../models/productModel");

// Schedule a job to run every 5 minutes
cron.schedule("* * * * *", async () => {
  console.log("[CRON] Checking and restoring expired discounts...");
  await restorePrices();
});
