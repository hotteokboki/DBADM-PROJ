const mySQL = require("../config/database.js");

exports.joinWaitlist = async (userId, productId) => {
  const connection = await mySQL.getConnection(); // begin connection for transaction

  try {
    await connection.beginTransaction();

    // Check if already in waitlist
    const [existing] = await connection.execute(
      "SELECT 1 FROM waitlist WHERE user_id = ? AND product_id = ?",
      [userId, productId]
    );

    if (existing.length > 0) {
      await connection.release();
      return { alreadyJoined: true };
    }

    // Insert into waitlist
    await connection.execute(
      `INSERT INTO waitlist (waitlist_id, user_id, product_id)
       VALUES (UUID(), ?, ?)`,
      [userId, productId]
    );

    await connection.commit();
    connection.release();

    return { success: true };
  } catch (error) {
    await connection.rollback();
    connection.release();
    throw error;
  }
}

// models/waitlistModel.js

exports.getWaitlist = async (userId, productId) => {
  const connection = await mySQL.getConnection();

  try {
    await connection.beginTransaction();

    const [rows] = await connection.query(
      `SELECT 1 FROM waitlist WHERE user_id = ? AND product_id = ? LIMIT 1`,
      [userId, productId]
    );

    await connection.commit();
    connection.release();

    return { success: true, isJoined: rows.length > 0 };
  } catch (error) {
    await connection.rollback();
    connection.release();
    throw error;
  }
};