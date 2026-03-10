// server.js

import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import cookieParser from 'cookie-parser';

import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { generalLimiter } from './middleware/rateLimiter.js';
import { startCleanupScheduler } from './utils/cleanup.js';

dotenv.config();

const app = express();

// ============================================
// CONNECT TO DATABASE
// ============================================

connectDB().then(() => {
    startCleanupScheduler();
}).catch((error) => {
    console.error('Failed to connect to database:', error.message);
    process.exit(1);
});

// ============================================
// SECURITY MIDDLEWARE
// ============================================

app.use(helmet());

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(generalLimiter);

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

app.use(cookieParser());

app.use(mongoSanitize());

app.use(hpp());

// ============================================
// ROUTES
// ============================================

app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is running!',
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString()
    });
});

app.use('/api/auth', authRoutes);

// ============================================
// ERROR HANDLING
// ============================================

app.use(notFound);
app.use(errorHandler);

// ============================================
// START SERVER
// ============================================

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log(`
    ╔═══════════════════════════════════════════════════════════╗
    ║                                                           ║
    ║        🚀 AUTH SERVER RUNNING SUCCESSFULLY! 🚀            ║
    ║                                                           ║
    ╠═══════════════════════════════════════════════════════════╣
    ║                                                           ║
    ║   Environment : ${(process.env.NODE_ENV || 'development').padEnd(38)}║
    ║   Port        : ${PORT.toString().padEnd(38)}║
    ║   URL         : ${'http://localhost:' + PORT.toString().padEnd(26)}║
    ║                                                           ║
    ╠═══════════════════════════════════════════════════════════╣
    ║                                                           ║
    ║   Available Endpoints:                                    ║
    ║   • POST /api/auth/register                               ║
    ║   • POST /api/auth/verify-otp                             ║
    ║   • POST /api/auth/resend-otp                             ║
    ║   • POST /api/auth/login                                  ║
    ║   • POST /api/auth/logout                                 ║
    ║   • POST /api/auth/refresh-token                          ║
    ║   • GET  /api/auth/verify-email/:token                    ║
    ║   • POST /api/auth/forgot-password                        ║
    ║   • POST /api/auth/reset-password/:token                  ║
    ║   • PUT  /api/auth/change-password                        ║
    ║   • GET  /api/auth/me                                     ║
    ║   • PUT  /api/auth/update-profile                         ║
    ║                                                           ║
    ╚═══════════════════════════════════════════════════════════╝
    `);
});

// ============================================
// GRACEFUL SHUTDOWN
// ============================================

process.on('unhandledRejection', (err, promise) => {
    console.error(`❌ Unhandled Rejection: ${err.message}`);
    server.close(() => process.exit(1));
});

process.on('uncaughtException', (err) => {
    console.error(`❌ Uncaught Exception: ${err.message}`);
    process.exit(1);
});

process.on('SIGTERM', () => {
    console.log('👋 SIGTERM received. Shutting down gracefully...');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('\n👋 SIGINT received. Shutting down gracefully...');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

export default app;