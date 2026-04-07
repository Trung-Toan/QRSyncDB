const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();
const logger = require('./../common/utils/logger');

const app = express();
app.set('trust proxy', true);

// Morgan -> Winston
const morganMiddleware = morgan(
    ':method :url :status :res[content-length] - :response-time ms',
    {
        stream: {
            write: (message) => logger.info(message.trim()),
        },
    }
);

app.use(morganMiddleware);

// CORS
const corsOptions = {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

// Routes
app.use("/api/payment", require("./routes/index.route"));

// 404
app.use((req, res) => {
    res.status(404).json({
        status: 'error',
        message: `Route ${req.originalUrl} not found`
    });
});

// Global Error Handler
app.use((err, req, res, next) => {
    logger.error('Error:', err);

    const statusCode = err.statusCode || 500;

    res.status(statusCode).json({
        status: 'error',
        errorCode: err.errorCode || 'INTERNAL_SERVER_ERROR',
        message: err.message || 'Internal Server Error',
        errors: err.errors || null,
        ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    });
});

module.exports = app;