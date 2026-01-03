import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
// import { connectDB } from './config/db.js';

import { config } from './config/env.js';
import router from './routes/index.js';
import billingRoutes from './routes/billing.routes.js';
import reviewRoutes from './routes/review.routes.js';

const app = express();

// Security & parsing middlewares
app.use(helmet());
app.use(cors({
    origin: config.nodeEnv === 'development' ? 'http://localhost:5173' : 'https://ai-code-review-eskd.onrender.com/',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}))

app.use(morgan(config.nodeEnv === 'development' ? 'dev' : 'combined'));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

// app.use(express.urlencoded({ extended: true }));
// app.use(morgan('dev'));

// Basic rate limiting (per IP)
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests, please try again later.'
})
app.use('/api', apiLimiter);

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        uptime: process.uptime(),
        message: 'Server is running'
    });
})

// API routes
app.use('/api', router);
app.use('/api/billing', billingRoutes);
app.use('/api/reviews', reviewRoutes);


// 404 handler
app.use((req, res, next) => {
    res.status(404).json({
        status: 'error',
        message: 'Route not found'
    });
})

// Error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    console.error(err.stack);
    const status = err.status || 500;
    res.status(status).json({
        status: 'error',
        message: err.message || 'Internal server error'
    });
})


export default app;