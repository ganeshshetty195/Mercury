require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

// Request logger should be here if you want all requests logged
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Routes
const streamRoutes = require('./routes/sse.routes');
app.use('/stream', streamRoutes);

const productsRouter = require('./routes/product.routes');
app.use('/products', productsRouter);

const authRoutes = require('./routes/auth.routes');
app.use('/auth', authRoutes);

const cartRoutes = require('./routes/cart.routes.js');
app.use('/cart', cartRoutes);

const orderRoutes = require('./routes/order.routes.js');
app.use('/order', orderRoutes);

// Error handler
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

// Redis startup
const { connectRedis, subscriber } = require('./database/redis');
const { broadcastStockUpdate } = require('./services/stockStream');

async function startServer() {
  try {
    await connectRedis();

    await subscriber.subscribe('stock-updates', (message) => {
      try {
        const payload = JSON.parse(message);
        broadcastStockUpdate(payload);
      } catch (err) {
        console.error('Failed to parse stock update:', err.message);
      }
    });

    console.log('✅ Redis subscriber connected');

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Startup failed:', error.message);
    process.exit(1);
  }
}

startServer();