const mySQL = require("../config/database.js"); // Import mySQL client

exports.getUserData = async () => {
  const query = `SELECT * FROM users;`;
  const [rows] = await mySQL.query(query);
  return rows;
};

exports.checkExistingUser = async (email) => {
  const query = `SELECT * FROM users WHERE email = ? LIMIT 1;`;
  const [rows] = await mySQL.query(query, [email]);
  return rows.length > 0 ? rows[0] : null;
};

exports.createUser = async (first_name, last_name, email, hashedPassword) => {
  const query = `
    INSERT INTO users (first_name, last_name, email, password, role_id)
    VALUES (?, ?, ?, ?, 1);
  `;
  const [result] = await mySQL.query(query, [first_name, last_name, email, hashedPassword]);

  return {
    id: result.insertId,
    first_name,
    last_name,
    email,
    role_id: 1
  };
};