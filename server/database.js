require('dotenv').config();
const mysql = require('mysql2/promise');

// Create pool with environment variables
const pool = mysql.createPool({
  host: process.env.DATABASE_HOSTNAME,
  user: process.env.DATABASE_USER,
  port: process.env.DATABASE_PORT,
  password: process.env.DATABASE_KEY,
  database: process.env.DATABASE_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test connection immediately
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log('🔗 Connected to MySQL');
    connection.release();
  } catch (err) {
    console.error('❌ Connection error', err);
  }
})();

module.exports = pool;