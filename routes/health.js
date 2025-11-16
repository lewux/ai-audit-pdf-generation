const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    const healthInfo = {
        success: true,
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: Math.floor(process.uptime()),
        memory: {
            used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
            total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB'
        },
        environment: process.env.NODE_ENV || 'development',
        version: require('../package.json').version
    };

    res.json(healthInfo);
});

module.exports = router;





