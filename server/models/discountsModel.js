const mySQL = require("../config/database.js");

exports.getAllDiscounts = async () => {
  const connection = await mySQL.getConnection();

  try {
    const query = `
      SELECT * FROM discounts;
    `;

    const [rows] = await connection.query(query);
    return { success: true, discounts: rows };
  } catch (err) {
    throw err;
  } finally {
    connection.release();
  }
};

exports.createDiscountQuery = async (discountData) => {
  const connection = await mySQL.getConnection();

  try {
    await connection.beginTransaction();

    const insertQuery = `
      INSERT INTO discounts 
        (discount_name, discount_type, discount_value, start_date, end_date)
      VALUES (?, ?, ?, ?, ?)
    `;

    await connection.query(insertQuery, [
      discountData.discount_name,
      discountData.discount_type,
      discountData.discount_value,  
      discountData.start_date,  
      discountData.end_date  
    ]);

    await connection.commit();
    return { success: true };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};