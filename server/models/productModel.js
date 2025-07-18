const mySQL = require("../config/database.js");

exports.insertProductQuery = async (productData) => {
  const connection = await mySQL.getConnection(); // Acquire connection

  try {
    await connection.beginTransaction(); // Start transaction

    const query = `
      INSERT INTO product 
      (product_name, product_description, price, stock_quantity, image_url) 
      VALUES (?, ?, ?, ?, ?)
    `;

    const [result] = await connection.query(query, [
      productData.product_name,
      productData.product_description,
      productData.price,
      productData.stock_quantity || 0,
      productData.image_url || null,
    ]);

    await connection.commit(); // Commit transaction
    return { success: true, product_id: result.insertId };
  } catch (err) {
    await connection.rollback(); // Rollback on error
    throw err; // Let the controller handle the error
  } finally {
    connection.release(); // Always release the connection
  }
};