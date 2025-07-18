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