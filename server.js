require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs-extra');

// Import routes
const authRoutes = require('./routes/auth');
const generateRoutes = require('./routes/generate');
const healthRoutes = require('./routes/health');
const downloadRoutes = require('./routes/download');

// Import middleware
const { auth: authRateLimitMiddleware, pdf: pdfRateLimitMiddleware, download: downloadRateLimitMiddleware, general: generalRateLimitMiddleware } = require('./middleware/rate-limit');
const authMiddleware = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3001;
// Railway requires listening on 0.0.0.0, not localhost
const HOST = process.env.HOST || '0.0.0.0';

// Trust proxy for Railway (fixes X-Forwarded-For issues with express-rate-limit)
// Railway uses a reverse proxy, so we need to trust the first proxy
app.set('trust proxy', 1);

// Ensure required directories exist
const ensureDirectories = async () => {
    try {
        // Use absolute paths for reliability on Railway
        const uploadDir = process.env.UPLOAD_DIR || path.join(__dirname, 'uploads');
        const logsDir = path.join(__dirname, 'logs');
        
        await fs.ensureDir(uploadDir);
        // On Railway logs are better written to stdout, but create directory just in case
        if (process.env.NODE_ENV !== 'production' || process.env.ENABLE_FILE_LOGS === 'true') {
            await fs.ensureDir(logsDir);
        }
    } catch (error) {
        console.error('Error creating directories:', error);
        process.exit(1);
    }
};

// Security middleware
app.use(helmet({
    contentSecurityPolicy: false, // Allow inline styles for PDF generation
    crossOriginEmbedderPolicy: false
}));

// CORS configuration
const corsOptions = {
    origin: process.env.ALLOWED_ORIGINS ? 
        process.env.ALLOWED_ORIGINS.split(',') : 
        ['http://localhost:3000'],
    credentials: true,
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Logging
app.use(morgan('combined'));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting - apply specific limits for each endpoint
// Health check - general limit (high, as it's lightweight)
app.use('/api/health', generalRateLimitMiddleware);

// Auth endpoints - strict limit (5 requests / 15 minutes)
app.use('/api/auth', authRateLimitMiddleware);

// PDF generation - separate limit (25 requests / 10 minutes)
app.use('/api/pdf', pdfRateLimitMiddleware);

// PDF download - separate limit (25 requests / 10 minutes)
app.use('/api/download', downloadRateLimitMiddleware);

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/pdf', authMiddleware, generateRoutes);
app.use('/api/download', authMiddleware, downloadRoutes);

// Note: Static /files route removed for security
// Use /api/download/:filename with Bearer token instead

// Error handling middleware
app.use((error, req, res, next) => {
    res.status(500).json({
        success: false,
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found'
    });
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT received. Shutting down gracefully...');
    process.exit(0);
});

// Validate critical environment variables
const validateEnvironment = () => {
    const required = ['JWT_SECRET'];
    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
        console.error('❌ Missing required environment variables:', missing.join(', '));
        console.error('Please set these variables in Railway dashboard');
        if (process.env.NODE_ENV === 'production') {
            process.exit(1);
        } else {
            console.warn('⚠️  Continuing in development mode, but authentication will fail');
        }
    }
    
    // Warnings for recommended variables
    if (!process.env.ALLOWED_ORIGINS && process.env.NODE_ENV === 'production') {
        console.warn('⚠️  ALLOWED_ORIGINS not set - CORS may block requests');
    }
    
    console.log('✅ Environment validation passed');
};

// Start server
const startServer = async () => {
    try {
        validateEnvironment();
        await ensureDirectories();
        
        app.listen(PORT, HOST, () => {
            console.log(`✅ PDF Server running on http://${HOST}:${PORT}`);
            console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`💾 Upload directory: ${process.env.UPLOAD_DIR || path.join(__dirname, 'uploads')}`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

startServer();

module.exports = app;

