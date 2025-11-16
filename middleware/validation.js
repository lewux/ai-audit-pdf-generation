const Joi = require('joi');

// Schema for audit data validation
const auditDataSchema = Joi.object({
    general_info: Joi.object({
        site_name: Joi.string().required(),
        site_url: Joi.string().uri().required(),
        audit_date: Joi.string().required(),
        site_description: Joi.string().allow('')
    }).required(),
    
    lighthouse_scores: Joi.object({
        mobile: Joi.object({
            total_score: Joi.number().min(0).max(100),
            performance: Joi.number().min(0).max(100),
            accessibility: Joi.number().min(0).max(100),
            best_practices: Joi.number().min(0).max(100),
            seo: Joi.number().min(0).max(100),
            summary: Joi.string().allow('')
        }),
        desktop: Joi.object({
            total_score: Joi.number().min(0).max(100),
            performance: Joi.number().min(0).max(100),
            accessibility: Joi.number().min(0).max(100),
            best_practices: Joi.number().min(0).max(100),
            seo: Joi.number().min(0).max(100),
            summary: Joi.string().allow('')
        })
    }),
    
    performance_metrics: Joi.object().optional(),
    seo_analysis: Joi.object().optional(),
    accessibility_best_practices: Joi.object().optional(),
    final_conclusion: Joi.object().optional()
});

const validateAuditData = (data) => {
    const { error, value } = auditDataSchema.validate(data, { 
        allowUnknown: true,
        stripUnknown: false 
    });
    
    if (error) {
        return {
            isValid: false,
            errors: error.details.map(detail => detail.message)
        };
    }
    
    return {
        isValid: true,
        data: value
    };
};

const validateRequest = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body);
        
        if (error) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: error.details.map(detail => detail.message)
            });
        }
        
        next();
    };
};

module.exports = {
    validateAuditData,
    validateRequest,
    auditDataSchema
};





