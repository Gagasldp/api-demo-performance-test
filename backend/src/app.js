const express = require('express');
require('dotenv').config();

const healthRoutes = require('./routes/health.routes');
const productRoutes = require('./routes/product.routes');
const authRoutes = require('./routes/auth.routes');
const cartRoutes = require('./routes/cart.routes');
const transactionRoutes = require('./routes/transaction.routes');


const app = express();

app.use(express.json());

app.use('/health', healthRoutes);
app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/transactions', transactionRoutes);

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});