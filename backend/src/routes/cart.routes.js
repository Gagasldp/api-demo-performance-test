const express = require('express');

const {
  addToCart,
  getCart
} = require('../controllers/cart.controller');

const authenticateToken = require('../middleware/auth.middleware');

const router = express.Router();

router.post(
  '/items',
  authenticateToken,
  addToCart
);

router.get(
  '/',
  authenticateToken,
  getCart
);

module.exports = router;