# AI Audit PDF Server

A standalone Express.js server for generating PDF reports from AI audit data.

## Features

- **PDF Generation**: Convert audit data to beautiful PDF reports using Puppeteer
- **REST API**: Clean API endpoints for PDF generation and file management
- **Security**: JWT authentication, rate limiting, input validation
- **File Management**: Automatic file cleanup and organized storage
- **Health Monitoring**: Built-in health check endpoints

## Quick Start

### 1. Environment Setup

Copy the environment template and configure:
```bash
cp environment.txt .env
# Edit .env with your actual values
```

### 2. Start Development Server

```bash
npm run dev
```

### 3. Test the Server

```bash
# Check health
curl http://localhost:3001/api/health

# Test PDF generation
npm run test
```

## API Endpoints

### Health Check
```
GET /api/health
```

### Authentication

#### Generate Token
```
POST /api/auth/token
Content-Type: application/json

{
  "test": true
}
```

#### Verify Token
```
GET /api/auth/verify
Authorization: Bearer <token>
```

See [AUTH_ENDPOINTS.md](./AUTH_ENDPOINTS.md) for complete authentication documentation.

### PDF Generation
```
POST /api/pdf
Authorization: Bearer <token>
Content-Type: application/json

{
  "data": {
    "general_info": {
      "site_name": "Example Site",
      "site_url": "https://example.com",
      "audit_date": "2025-09-29"
    },
    "lighthouse_scores": {
      // ... audit data
    }
  }
}
```

### File Download
```
GET /api/download/:filename
Authorization: Bearer <token>
```

### File Info
```
GET /api/download/info/:filename
Authorization: Bearer <token>
```

## Project Structure

```
pdf-server/
├── server.js                 # Main server file
├── package.json
├── .env                      # Environment variables (create from environment.txt)
├── routes/
│   ├── health.js            # Health check endpoint
│   ├── generate.js          # PDF generation endpoint
│   └── download.js          # File download endpoints
├── services/
│   ├── pdf-generator.js     # Core PDF generation logic
│   └── data-validator.js    # Data validation service
├── middleware/
│   ├── auth.js              # JWT authentication
│   ├── rate-limit.js        # Rate limiting
│   └── validation.js        # Input validation schemas
├── templates/               # HTML templates and assets
├── uploads/                 # Generated PDF files
├── logs/                    # Application logs
└── test-generate.js         # Test file
```

## Configuration

Key environment variables:

- `PORT`: Server port (default: 3001)
- `JWT_SECRET`: Secret for JWT tokens
- `UPLOAD_DIR`: Directory for generated files
- `PUPPETEER_HEADLESS`: Run browser in headless mode
- `ALLOWED_ORIGINS`: CORS allowed origins

## Development

### Testing
```bash
npm run test          # Test PDF generation
npm run dev           # Start with auto-reload
./test-auth.sh        # Test authentication endpoints
```

### Production Deployment
```bash
npm run pm2:start     # Start with PM2
npm run pm2:logs      # View logs
npm run pm2:restart   # Restart service
```

## Security Features

- JWT token authentication
- Request rate limiting (10 requests per 15 minutes by default)
- Input validation with Joi schemas
- CORS protection
- Helmet security headers
- File path validation to prevent directory traversal

## WordPress Integration

To integrate with WordPress, send POST requests to the `/api/pdf` endpoint with your audit data. The server will return a JSON response with the generated PDF URL and metadata.

Example response:
```json
{
  "success": true,
  "pdf_url": "/files/report-20250929-143052.pdf",
  "pdf_path": "/path/to/uploads/report-20250929-143052.pdf",
  "file_size": 1234567,
  "generation_time": "2350ms"
}
```

## Troubleshooting

### Common Issues

1. **Browser fails to start**: Make sure you have the required system dependencies for Puppeteer
2. **Template not found**: Ensure templates were copied correctly from `ai-audit-master 2/template/`
3. **Permission errors**: Check that the uploads directory has write permissions
4. **JWT errors**: Verify your JWT_SECRET is set and is at least 32 characters

### Logs

Check application logs in the `logs/` directory or use PM2 logs:
```bash
npm run pm2:logs
```

## License

MIT License

