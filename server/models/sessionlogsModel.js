const mySQL = require("../config/database.js");

exports.getSessionLogs = async () => {
  const connection = await mySQL.getConnection();

  try {
    const query = `
        SELECT 
            sl.log_id, 
            sl.user_id, 
            sl.action, 
            sl.timestamp, 
            u.first_name, 
            u.last_name, 
            u.email 
        FROM session_logs AS sl
        JOIN users AS u ON u.user_id = sl.user_id;
    `;

    const [rows] = await connection.query(query);
    return { success: true, sessionlogs: rows };
  } catch (err) {
    throw err;
  } finally {
    connection.release();
  }
};