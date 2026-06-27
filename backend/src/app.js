const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { globalLimiter, xssSanitizer } = require('./middlewares/securityMiddleware');
const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const orderRoutes = require('./routes/orderRoutes');
const userRoutes = require('./routes/userRoutes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// Apply security headers
app.use(helmet());

// Apply global rate limiting
app.use(globalLimiter);

// Request parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sanitize inputs recursively to prevent XSS injection
app.use(xssSanitizer);

const allowedOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173'];
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

// Secure CORS configuration
app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));



app.use('/auth', authRoutes);
app.use('/categories', categoryRoutes);
app.use('/products', productRoutes);
app.use('/cart', cartRoutes);
app.use('/wishlist', wishlistRoutes);
app.use('/orders', orderRoutes);
app.use('/users', userRoutes);

app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
});

app.use(errorHandler);

module.exports = app;
