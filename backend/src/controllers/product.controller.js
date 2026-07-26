const pool = require('../config/database');

const getProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const offset = (page - 1) * limit;

    const [products] = await pool.query(
      `SELECT id, pname, pdescription, price, stock
       FROM products
       ORDER BY id
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    const [[countResult]] = await pool.query(
      'SELECT COUNT(*) AS total FROM products'
    );

    res.status(200).json({
      success: true,
      page,
      limit,
      total: countResult.total,
      data: products
    });
  } catch (error) {
    console.error('Error fetching products:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch products'
    });
  }
};

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const [products] = await pool.query(
      `SELECT id, pname, pdescription, price, stock
       FROM products
       WHERE id = ?`,
      [id]
    );

    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      data: products[0]
    });
  } catch (error) {
    console.error('Error fetching product:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch product'
    });
  }
};

module.exports = {
  getProducts,
  getProductById
};