const pool = require('../config/database');

const addToCart = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const userId = req.user.userId;
    const { productId, quantity } = req.body;

    // Validate request
    if (!productId || !quantity || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Product ID and valid quantity are required'
      });
    }

    await connection.beginTransaction();

    // Check product
    const [products] = await connection.query(
      `SELECT id, pname, price, stock
       FROM products
       WHERE id = ?`,
      [productId]
    );

    if (products.length === 0) {
      await connection.rollback();

      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const product = products[0];

    // Check stock
    if (product.stock < quantity) {
      await connection.rollback();

      return res.status(400).json({
        success: false,
        message: 'Insufficient stock'
      });
    }

    // Find active cart
    const [carts] = await connection.query(
      `SELECT id
       FROM carts
       WHERE user_id = ?
       AND status = 'ACTIVE'
       LIMIT 1`,
      [userId]
    );

    let cartId;

    // Create cart if user doesn't have active cart
    if (carts.length === 0) {
      const [cartResult] = await connection.query(
        `INSERT INTO carts (user_id)
         VALUES (?)`,
        [userId]
      );

      cartId = cartResult.insertId;
    } else {
      cartId = carts[0].id;
    }

    // Add product to cart
    await connection.query(
      `INSERT INTO cart_items
       (cart_id, product_id, quantity)
       VALUES (?, ?, ?)`,
      [cartId, productId, quantity]
    );

    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'Product added to cart',
      data: {
        cartId,
        productId,
        quantity
      }
    });

  } catch (error) {
    await connection.rollback();

    console.error('Add to cart error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to add product to cart'
    });

  } finally {
    connection.release();
  }
};

const getCart = async (req, res) => {
  try {
    const userId = req.user.userId;

    const [rows] = await pool.query(
      `SELECT
          c.id AS cartId,
          c.status,
          ci.product_id AS productId,
          p.pname,
          p.price,
          ci.quantity,
          (p.price * ci.quantity) AS subtotal
       FROM carts c
       LEFT JOIN cart_items ci
          ON c.id = ci.cart_id
       LEFT JOIN products p
          ON ci.product_id = p.id
       WHERE c.user_id = ?
       AND c.status = 'ACTIVE'
       ORDER BY ci.id`,
      [userId]
    );

    if (rows.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'Cart is empty',
        data: []
      });
    }

    const cart = {
      cartId: rows[0].cartId,
      status: rows[0].status,
      items: rows
        .filter(row => row.productId !== null)
        .map(row => ({
          productId: row.productId,
          pname: row.pname,
          price: row.price,
          quantity: row.quantity,
          subtotal: row.subtotal
        }))
    };

    cart.total = cart.items.reduce(
      (sum, item) => sum + Number(item.subtotal),
      0
    );

    res.status(200).json({
      success: true,
      data: cart
    });

  } catch (error) {
    console.error('Get cart error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to get cart'
    });
  }
};

module.exports = {
  addToCart,
  getCart
};