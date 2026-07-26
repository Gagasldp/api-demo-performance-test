const pool = require('../config/database');

const checkHealth = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 AS result');

    res.status(200).json({
      success: true,
      message: 'API and database are connected',
      database: rows[0].result === 1
    });
  } catch (error) {
    console.error('Database connection error:', error);

    res.status(500).json({
      success: false,
      message: 'Database connection failed'
    });
  }
};

module.exports = {
  checkHealth
};