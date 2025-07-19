const mySQL = require("../config/database.js");

exports.insertProductQuery = async (productData) => {
  const connection = await mySQL.getConnection();

  try {
    await connection.beginTransaction();

    const productQuery = `
      INSERT INTO product 
      (product_name, product_description, price, stock_quantity, image_url) 
      VALUES (?, ?, ?, ?, ?)
    `;

    const [productResult] = await connection.query(productQuery, [
      productData.product_name,
      productData.product_description,
      productData.price,
      productData.stock_quantity || 0,
      JSON.stringify(productData.image_urls || []), // Store array as JSON
    ]);

    await connection.commit();
    return { success: true, product_id: productResult.insertId };
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
};

exports.getProductsWithoutDiscount = async () => {
  const connection = await mySQL.getConnection();

  try {
    const query = `
      SELECT * FROM product 
      WHERE is_onSale = 0
    `;

    const [rows] = await connection.query(query);
    return { success: true, products: rows };
  } catch (err) {
    throw err;
  } finally {
    connection.release();
  }
};

exports.restorePrices = async () => {
  const connection = await mySQL.getConnection();
  try {
    await connection.beginTransaction();

    const [expiredDiscounts] = await connection.query(`
      SELECT discount_id FROM discounts 
      WHERE end_date < NOW() AND is_active = 1
    `);

    for (const { discount_id } of expiredDiscounts) {
      // Get affected products and their original prices
      const [priceLogs] = await connection.query(`
        SELECT product_id, original_price FROM product_price_log 
        WHERE discount_id = ?
      `, [discount_id]);

      for (const { product_id, original_price } of priceLogs) {
        await connection.query(`
          UPDATE product
          SET price = ?, is_onSale = 0
          WHERE product_id = ?
        `, [original_price, product_id]);
      }

      // Mark discount inactive
      await connection.query(`
        UPDATE discounts SET is_active = 0 WHERE discount_id = ?
      `, [discount_id]);
    }

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    console.error("Failed to restore prices:", error);
  } finally {
    connection.release();
  }
};