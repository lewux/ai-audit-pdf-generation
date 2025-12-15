const express = require('express');
const router = express.Router();
const PDFGenerator = require('../services/pdf-generator');
const { validateAuditData } = require('../services/data-validator');

router.post('/', async (req, res) => {
    try {
        // Validate input data
        const validationResult = validateAuditData(req.body.data);
        if (!validationResult.isValid) {
            return res.status(400).json({
                success: false,
                error: 'Invalid data format',
                details: validationResult.errors
            });
        }

        // Generate PDF
        const generator = new PDFGenerator();
        const result = await generator.generateFromData(req.body.data);

        res.json({
            success: true,
            pdf_url: result.url,
            pdf_path: result.path,
            file_size: result.size,
            generation_time: result.duration
        });

    } catch (error) {
        // Log full error for debugging
        console.error('PDF Generation Error:', error);
        console.error('Error stack:', error.stack);
        
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;

