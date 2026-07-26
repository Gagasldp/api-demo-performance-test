const express = require('express');

const {
  checkout
} = require('../controllers/transaction.controller');

const authenticateToken = require('../middleware/auth.middleware');

const router = express.Router();

router.post(
  '/checkout',
  authenticateToken,
  checkout
);

module.exports = router;