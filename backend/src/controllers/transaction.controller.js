const pool = require('../config/database');

const checkout = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const userId = req.user.userId;

    await connection.beginTransaction();

    // 1. Get active cart
    const [carts] = await connection.query(
      `SELECT id
       FROM carts
       WHERE user_id = ?
       AND status = 'ACTIVE'
       LIMIT 1
       FOR UPDATE`,
      [userId]
    );

    if (carts.length === 0) {
      await connection.rollback();

      return res.status(400).json({
        success: false,
        message: 'Active cart not found'
      });
    }

    const cartId = carts[0].id;

    // 2. Get cart items
    const [cartItems] = await connection.query(
      `SELECT
          ci.product_id,
          ci.quantity,
          p.pname,
          p.price,
          p.stock
       FROM cart_items ci
       JOIN products p
         ON ci.product_id = p.id
       WHERE ci.cart_id = ?
       FOR UPDATE`,
      [cartId]
    );

    if (cartItems.length === 0) {
      await connection.rollback();

      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }

    // 3. Check stock and calculate total
    let totalAmount = 0;

    for (const item of cartItems) {
      if (item.stock < item.quantity) {
        await connection.rollback();

        return res.status(400).json({
          success: false,
          message: `Insufficient stock for product ${item.product_id}`
        });
      }

      totalAmount += Number(item.price) * item.quantity;
    }

    // 4. Create transaction
    const [transactionResult] = await connection.query(
      `INSERT INTO transactions
       (user_id, cart_id, total_amount, status)
       VALUES (?, ?, ?, 'SUCCESS')`,
      [userId, cartId, totalAmount]
    );

    const transactionId = transactionResult.insertId;

    // 5. Create transaction items
    for (const item of cartItems) {
      const subtotal =
        Number(item.price) * item.quantity;

      await connection.query(
        `INSERT INTO transaction_items
         (transaction_id, product_id, quantity, price, subtotal)
         VALUES (?, ?, ?, ?, ?)`,
        [
          transactionId,
          item.product_id,
          item.quantity,
          item.price,
          subtotal
        ]
      );

      // 6. Reduce stock
      await connection.query(
        `UPDATE products
         SET stock = stock - ?
         WHERE id = ?`,
        [
          item.quantity,
          item.product_id
        ]
      );
    }

    // 7. Mark cart as checked out
    await connection.query(
      `UPDATE carts
       SET status = 'CHECKED_OUT'
       WHERE id = ?`,
      [cartId]
    );

    // 8. Commit transaction
    await connection.commit();

    return res.status(201).json({
      success: true,
      message: 'Checkout successful',
      data: {
        transactionId,
        cartId,
        totalAmount,
        items: cartItems.map(item => ({
          productId: item.product_id,
          quantity: item.quantity,
          price: item.price,
          subtotal:
            Number(item.price) * item.quantity
        }))
      }
    });

  } catch (error) {
    await connection.rollback();

    console.error('Checkout error:', error);

    return res.status(500).json({
      success: false,
      message: 'Checkout failed'
    });

  } finally {
    connection.release();
  }
};

module.exports = {
  checkout
};