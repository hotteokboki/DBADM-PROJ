const mySQL = require("../config/database.js"); // Import mySQL client

exports.getUserData = async () => {
  const query = `SELECT * FROM users;`;
  const [rows] = await mySQL.query(query);
  return rows;
};
