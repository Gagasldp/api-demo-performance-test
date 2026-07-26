const express = require('express');

const {
  getProducts,
  getProductById
} = require('../controllers/product.controller');

const authenticateToken = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/', authenticateToken, getProducts);

router.get('/:id', authenticateToken, getProductById);

module.exports = router;