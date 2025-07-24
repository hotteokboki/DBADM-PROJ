const mySQL = require("../config/database.js");

exports.getUserOrders = async (user_id) => {
  const connection = await mySQL.getConnection();

  try {
    const query = `
        SELECT
        o.order_id,
        o.order_date,
        o.order_total_amount,
        o.status AS current_status,

        -- Transaction Info
        t.transaction_id,
        t.payment_mode,
        ts.status_name,
        t.transaction_date,

        -- Address Info
        a.full_name,
        a.phone_number,
        a.street_address,
        a.city,
        a.province,
        a.postal_code

        FROM orders o
        LEFT JOIN transactions t ON o.transaction_id = t.transaction_id
        LEFT JOIN user_addresses a ON o.address_id = a.address_id
        LEFT JOIN transaction_statuses ts ON ts.status_id = t.status_id
        WHERE o.user_id = ?
    `;

    const [rows] = await connection.query(query, [user_id]);
    return { success: true, orders: rows };
  } catch (err) {
    throw err;
  } finally {
    connection.release();
  }
};

exports.getAllOrders = async () => {
  const connection = await mySQL.getConnection();

  try {
    const query = `
        SELECT
        o.order_id,
        o.order_date,
        o.order_total_amount,
        o.status AS current_status,

        -- Transaction Info
        t.transaction_id,
        t.payment_mode,
        ts.status_name,
        t.transaction_date,

        -- Address Info
        a.full_name,
        a.phone_number,
        a.street_address,
        a.city,
        a.province,
        a.postal_code

        FROM orders o
        LEFT JOIN transactions t ON o.transaction_id = t.transaction_id
        LEFT JOIN user_addresses a ON o.address_id = a.address_id
        LEFT JOIN transaction_statuses ts ON ts.status_id = t.status_id
    `;

    const [rows] = await connection.query(query);
    return { success: true, orders: rows };
  } catch (err) {
    throw err;
  } finally {
    connection.release();
  }
};