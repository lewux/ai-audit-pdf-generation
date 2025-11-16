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
const rateLimitMiddleware = require('./middleware/rate-limit');
const authMiddleware = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || 'localhost';

// Ensure required directories exist
const ensureDirectories = async () => {
    try {
        await fs.ensureDir(process.env.UPLOAD_DIR || './uploads');
        await fs.ensureDir('./logs');
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

// Rate limiting
app.use('/api/', rateLimitMiddleware);

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/pdf', authMiddleware, generateRoutes);
app.use('/api/download', authMiddleware, downloadRoutes);

// Serve static files (for generated PDFs)
app.use('/files', express.static(path.join(__dirname, 'uploads')));

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

// Start server
const startServer = async () => {
    try {
        await ensureDirectories();
        
        app.listen(PORT, HOST, () => {
            console.log(`PDF Server running on http://${HOST}:${PORT}`);
            console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();

module.exports = app;

