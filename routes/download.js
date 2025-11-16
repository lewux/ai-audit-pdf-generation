const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs-extra');

router.get('/:filename', async (req, res) => {
    try {
        const { filename } = req.params;
        
        // Security: only allow PDF files and validate filename
        if (!filename.endsWith('.pdf') || filename.includes('..') || filename.includes('/')) {
            return res.status(400).json({
                success: false,
                error: 'Invalid filename'
            });
        }

        const filePath = path.join(__dirname, '../uploads', filename);
        
        // Check if file exists
        if (!(await fs.pathExists(filePath))) {
            return res.status(404).json({
                success: false,
                error: 'File not found'
            });
        }

        // Get file stats
        const stats = await fs.stat(filePath);
        
        // Set headers for download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Length', stats.size);

        // Stream file
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);

    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to download file'
        });
    }
});

// Get file info without downloading
router.get('/info/:filename', async (req, res) => {
    try {
        const { filename } = req.params;
        
        if (!filename.endsWith('.pdf') || filename.includes('..') || filename.includes('/')) {
            return res.status(400).json({
                success: false,
                error: 'Invalid filename'
            });
        }

        const filePath = path.join(__dirname, '../uploads', filename);
        
        if (!(await fs.pathExists(filePath))) {
            return res.status(404).json({
                success: false,
                error: 'File not found'
            });
        }

        const stats = await fs.stat(filePath);
        
        res.json({
            success: true,
            filename: filename,
            size: stats.size,
            created: stats.birthtime,
            modified: stats.mtime
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to get file info'
        });
    }
});

module.exports = router;

