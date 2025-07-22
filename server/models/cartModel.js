const mySQL = require("../config/database.js");

exports.addToCart = async ({ userId, productId, quantity, priceAtAddition }) => {
  const connection = await mySQL.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Get or create the user's cart
    const [cartRows] = await connection.query(
      "SELECT cart_id FROM cart WHERE user_id = ?",
      [userId]
    );

    let cartId;

    if (cartRows.length === 0) {
      await connection.query("INSERT INTO cart (user_id) VALUES (?)", [userId]);

      const [newCart] = await connection.query(
        "SELECT cart_id FROM cart WHERE user_id = ?",
        [userId]
      );
      cartId = newCart[0].cart_id;
    } else {
      cartId = cartRows[0].cart_id;
    }

    // 2. Check if product already exists in cart
    const [existing] = await connection.query(
      "SELECT product_quantity FROM cart_items WHERE cart_id = ? AND product_id = ?",
      [cartId, productId]
    );

    if (existing.length > 0) {
      const newQty = existing[0].product_quantity + quantity;

      await connection.query(
        `UPDATE cart_items
         SET product_quantity = ?, price_at_addition = ?, added_at = CURRENT_TIMESTAMP
         WHERE cart_id = ? AND product_id = ?`,
        [newQty, priceAtAddition, cartId, productId]
      );
    } else {
      await connection.query(
        `INSERT INTO cart_items
         (cart_id, product_id, product_quantity, price_at_addition)
         VALUES (?, ?, ?, ?)`,
        [cartId, productId, quantity, priceAtAddition]
      );
    }

    await connection.commit();
    return { success: true, cartId };
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
};

exports.getCartItems = async (userId) => {
  const connection = await mySQL.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Get the user's cart ID
    const [cartRows] = await connection.query(
      "SELECT cart_id FROM cart WHERE user_id = ?",
      [userId]
    );

    if (cartRows.length === 0) {
      await connection.commit();
      return []; // no cart yet, return empty
    }

    const cartId = cartRows[0].cart_id;

    // 2. Fetch cart items and joined product data
    const [items] = await connection.query(
      `
      SELECT
        ci.product_id,
        ci.product_quantity AS amount,
        ci.price_at_addition,
        ci.added_at,
        p.product_name,
        p.price,
        p.is_onSale,
        JSON_EXTRACT(p.image_url, '$[0]') AS images
      FROM cart_items ci
      JOIN product p ON ci.product_id = p.product_id
      WHERE ci.cart_id = ?
      `,
      [cartId]
    );

    await connection.commit();
    return items;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

exports.removeCartItem = async (userId, productId) => {
  const connection = await mySQL.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Get cart_id for this user
    const [cartRows] = await connection.query(
      "SELECT cart_id FROM cart WHERE user_id = ?",
      [userId]
    );

    if (cartRows.length === 0) {
      await connection.rollback(); // nothing to remove
      throw new Error("Cart not found");
    }

    const cartId = cartRows[0].cart_id;

    // 2. Remove the product from cart_items
    const [deleteResult] = await connection.query(
      "DELETE FROM cart_items WHERE cart_id = ? AND product_id = ?",
      [cartId, productId]
    );

    if (deleteResult.affectedRows === 0) {
      await connection.rollback(); // no item was deleted
      throw new Error("Product not found in cart");
    }

    await connection.commit();
    return { success: true, message: "Item removed from cart" };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};