const mySQL = require("../config/database.js"); // Import mySQL client

exports.insertSession = async (user_id, sessionId, expires_at) => {
  const query = `
    INSERT INTO sessions (session_id, user_id, expires_at)
    VALUES (?, ?, ?);
  `;
  const [result] = await mySQL.query(query, [sessionId, user_id,expires_at]);
  return result;
};

exports.deleteSession = async (sessionId) => {
  const query = `DELETE FROM sessions WHERE session_id = ?`;
  await mySQL.query(query, [sessionId]);
};
