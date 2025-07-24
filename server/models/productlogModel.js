const mySQL = require("../config/database.js");

exports.getProductLogs = async () => {
  const connection = await mySQL.getConnection();

  try {
    const query = `
        SELECT 
            pl.log_id,
            u.first_name,
            u.last_name, 
            pl.action_type, 
            p.product_id,
            p.product_name, 
            p.product_description
        FROM product_logs AS pl
        JOIN product AS p ON p.product_id = pl.product_id
        JOIN users AS u ON u.user_id = pl.user_id
    `;

    const [rows] = await connection.query(query);
    return { success: true, productlogs: rows };
  } catch (err) {
    throw err;
  } finally {
    connection.release();
  }
};