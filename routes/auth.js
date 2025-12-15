const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

/**
 * POST /api/auth/token
 * Generate a new JWT token
 * 
 * Requires valid client credentials:
 * {
 *   "client_id": "your-client-id",
 *   "client_secret": "your-client-secret"
 * }
 * 
 * Optional parameters:
 * {
 *   "client_id": "your-client-id",
 *   "client_secret": "your-client-secret",
 *   "userId": "custom-user-id",
 *   "email": "user@example.com",
 *   "role": "client"
 * }
 */
router.post('/token', async (req, res) => {
    try {
        const { client_id, client_secret, userId, email, role } = req.body;

        // Require credentials in all environments
        if (!client_id || !client_secret) {
            return res.status(400).json({
                success: false,
                error: 'client_id and client_secret are required'
            });
        }

        // In production, you would validate against a database
        // For now, we'll use environment variables
        const validClientId = process.env.API_CLIENT_ID;
        const validClientSecret = process.env.API_CLIENT_SECRET;

        if (!validClientId || !validClientSecret) {
            return res.status(500).json({
                success: false,
                error: 'Server authentication not configured. Set API_CLIENT_ID and API_CLIENT_SECRET in .env'
            });
        }

        // Validate credentials
        if (client_id !== validClientId) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }

        // Compare secrets using bcrypt for security
        let secretMatch = false;
        try {
            secretMatch = await bcrypt.compare(client_secret, validClientSecret);
        } catch (bcryptError) {
            // If bcrypt comparison fails, try direct comparison as fallback
            // (useful if secret is stored as plain text)
            secretMatch = client_secret === validClientSecret;
        }
        
        if (!secretMatch) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }

        // Generate token
        const payload = {
            userId: userId || client_id,
            email: email || `${client_id}@api.client`,
            role: role || 'client',
            client_id: client_id,
            generated_at: new Date().toISOString()
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRY || '24h'
        });

        res.json({
            success: true,
            token: token,
            token_type: 'Bearer',
            expires_in: process.env.JWT_EXPIRY || '24h'
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to generate token'
        });
    }
});

/**
 * POST /api/auth/refresh
 * Refresh an existing JWT token
 */
router.post('/refresh', async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'Token required'
            });
        }

        // Verify and decode the old token
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(403).json({
                    success: false,
                    error: 'Invalid or expired token'
                });
            }

            // Generate new token with same payload
            const payload = {
                userId: decoded.userId,
                email: decoded.email,
                role: decoded.role,
                client_id: decoded.client_id,
                generated_at: new Date().toISOString()
            };

            const newToken = jwt.sign(payload, process.env.JWT_SECRET, {
                expiresIn: process.env.JWT_EXPIRY || '24h'
            });

            res.json({
                success: true,
                token: newToken,
                token_type: 'Bearer',
                expires_in: process.env.JWT_EXPIRY || '24h',
                usage: `Authorization: Bearer ${newToken}`
            });
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to refresh token'
        });
    }
});

/**
 * GET /api/auth/verify
 * Verify if a token is valid
 */
router.get('/verify', (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            valid: false,
            error: 'Token required'
        });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({
                success: false,
                valid: false,
                error: 'Invalid or expired token'
            });
        }

        res.json({
            success: true,
            valid: true,
            payload: decoded,
            expires_at: new Date(decoded.exp * 1000).toISOString()
        });
    });
});

module.exports = router;

