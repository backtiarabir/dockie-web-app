const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Config
dotenv.config();
const db = require('./config/db');

// Error Handling
const AppError = require('./utils/AppError');
const globalErrorHandler = require('./middlewares/errorMiddleware');

// App Init
const app = express();

// Global Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json()); // Body parser

// Rate Limiting
const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Too many requests from this IP, please try again in an hour!'
});
app.use('/api', limiter);

// Test Route
app.get('/', (req, res) => {
    res.status(200).json({ status: 'success', message: 'Dockiee Backend is running!' });
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/student', require('./routes/studentRoutes'));
app.use('/api/printer', require('./routes/printerRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// 404 Handler
app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global Error Handler
app.use(globalErrorHandler);

// Server Start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
