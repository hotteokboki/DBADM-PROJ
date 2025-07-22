const mySQL = require("../config/database.js");

exports.addToWishlist = async (userId, productId) => {
  const connection = await mySQL.getConnection();

  try {
    await connection.beginTransaction();

    const insertQuery = `
      INSERT INTO wishlist (user_id, product_id)
      VALUES (?, ?)
      ON DUPLICATE KEY UPDATE added_at = CURRENT_TIMESTAMP
    `;

    await connection.query(insertQuery, [userId, productId]);

    await connection.commit();
    return { success: true, message: "Added to wishlist" };
  } catch (err) {
    await connection.rollback();
    console.error("Error adding to wishlist:", err.message);
    throw err;
  } finally {
    connection.release();
  }
};

exports.removeFromWishlist = async (userId, productId) => {
  const connection = await mySQL.getConnection();

  try {
    await connection.beginTransaction();

    const deleteQuery = `
      DELETE FROM wishlist 
      WHERE user_id = ? AND product_id = ?
    `;

    await connection.query(deleteQuery, [userId, productId]);

    await connection.commit();
    return { success: true, message: "Removed from wishlist" };
  } catch (err) {
    await connection.rollback();
    console.error("Error removing from wishlist:", err.message);
    throw err;
  } finally {
    connection.release();
  }
};

exports.getWishlistByUser = async (userId) => {
  const connection = await mySQL.getConnection();

  try {
    const selectQuery = `
      SELECT p.*
      FROM wishlist w
      JOIN product p ON w.product_id = p.product_id
      WHERE w.user_id = ?
    `;

    const [results] = await connection.query(selectQuery, [userId]);

    return results;
  } catch (err) {
    console.error("Error fetching wishlist:", err.message);
    throw err;
  } finally {
    connection.release();
  }
};

exports.getWishlistByProductID = async (productId) => {
  const connection = await mySQL.getConnection();

  try {
    const selectQuery = `
      SELECT p.*
      FROM wishlist w
      JOIN product p ON w.product_id = p.product_id
      WHERE p.product_id = ?
    `;

    const [results] = await connection.query(selectQuery, [productId]);

    return results;
  } catch (err) {
    console.error("Error fetching wishlist item:", err.message);
    throw err;
  } finally {
    connection.release();
  }
};