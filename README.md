# AI Audit PDF Server

A standalone Express.js server for generating PDF reports from AI audit data.

**Production URL:** https://ai-audit-pdf-generation-production.up.railway.app

## Features

- **PDF Generation**: Convert audit data to beautiful PDF reports using Puppeteer
- **REST API**: Clean API endpoints for PDF generation and file management
- **Security**: JWT authentication, rate limiting, input validation
- **Protected Token Generation**: Requires valid API credentials
- **Health Monitoring**: Built-in health check endpoints

## Quick Start

### 1. Environment Setup

Set these environment variables (in Railway or `.env` for local development):

```env
NODE_ENV=production
PORT=3001
JWT_SECRET=<your-jwt-secret-min-32-chars>
API_CLIENT_ID=<your-client-id>
API_CLIENT_SECRET=<your-client-secret>
ALLOWED_ORIGINS=https://yourdomain.com
```

### 2. Get API Token

```bash
curl -X POST https://ai-audit-pdf-generation-production.up.railway.app/api/auth/token \
  -H "Content-Type: application/json" \
  -d '{
    "client_id": "your-client-id",
    "client_secret": "your-client-secret"
  }'
```

### 3. Generate PDF

```bash
curl -X POST https://ai-audit-pdf-generation-production.up.railway.app/api/pdf \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"data": {...}}'
```

## API Endpoints

### Health Check (no auth required)
```
GET /api/health
```

### Authentication

#### Generate Token
```
POST /api/auth/token
Content-Type: application/json

{
  "client_id": "your-client-id",
  "client_secret": "your-client-secret"
}
```

#### Verify Token
```
GET /api/auth/verify
Authorization: Bearer <token>
```

#### Refresh Token
```
POST /api/auth/refresh
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
├── routes/
│   ├── auth.js              # Authentication endpoints
│   ├── health.js            # Health check endpoint
│   ├── generate.js          # PDF generation endpoint
│   └── download.js          # File download endpoints
├── services/
│   ├── pdf-generator.js     # Core PDF generation logic
│   └── data-validator.js    # Data validation service
├── middleware/
│   ├── auth.js              # JWT authentication
│   ├── rate-limit.js        # Rate limiting (general + auth)
│   └── validation.js        # Input validation schemas
├── templates/               # HTML templates and assets
└── uploads/                 # Generated PDF files
```

## Configuration

### Required Environment Variables:

| Variable | Description |
|----------|-------------|
| `JWT_SECRET` | Secret for JWT tokens (min 32 chars) |
| `API_CLIENT_ID` | Client ID for token generation |
| `API_CLIENT_SECRET` | Client secret for token generation |

### Optional Environment Variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 3001 | Server port |
| `JWT_EXPIRY` | 24h | Token expiration time |
| `AUTH_RATE_LIMIT` | 5 | Token requests per 15 min |
| `API_RATE_LIMIT` | 10 | API requests per 15 min |
| `ALLOWED_ORIGINS` | localhost:3000 | CORS allowed origins |

## Security Features

- **JWT token authentication** - all protected endpoints require valid token
- **Credential-based token generation** - no test mode in production
- **Strict rate limiting** - 5 token attempts per 15 minutes
- **General rate limiting** - 10 API requests per 15 minutes
- **Input validation** with Joi schemas
- **CORS protection** - configurable allowed origins
- **Helmet security headers**
- **File path validation** to prevent directory traversal

## WordPress Integration

```php
<?php
function lewux_get_pdf_token() {
    $client_id = get_option('lewux_api_client_id');
    $client_secret = get_option('lewux_api_client_secret');
    
    $response = wp_remote_post('https://ai-audit-pdf-generation-production.up.railway.app/api/auth/token', [
        'headers' => ['Content-Type' => 'application/json'],
        'body' => json_encode([
            'client_id' => $client_id,
            'client_secret' => $client_secret
        ])
    ]);
    
    $body = json_decode(wp_remote_retrieve_body($response), true);
    return $body['token'] ?? false;
}

function lewux_generate_pdf($audit_data) {
    $token = lewux_get_pdf_token();
    
    $response = wp_remote_post('https://ai-audit-pdf-generation-production.up.railway.app/api/pdf', [
        'headers' => [
            'Authorization' => 'Bearer ' . $token,
            'Content-Type' => 'application/json'
        ],
        'body' => json_encode(['data' => $audit_data]),
        'timeout' => 60
    ]);
    
    return json_decode(wp_remote_retrieve_body($response), true);
}
?>
```

## Troubleshooting

### Common Issues

1. **"Invalid credentials"** - Check API_CLIENT_ID and API_CLIENT_SECRET in environment
2. **"Too many authentication attempts"** - Rate limited, wait 15 minutes
3. **"Access token required"** - Include `Authorization: Bearer <token>` header
4. **Browser fails to start** - Ensure 1GB memory for Puppeteer
5. **JWT errors** - Verify JWT_SECRET is set and is at least 32 characters

## Documentation

- [QUICK_START.md](./QUICK_START.md) - Quick start guide
- [AUTH_ENDPOINTS.md](./AUTH_ENDPOINTS.md) - Authentication documentation
- [API_ENDPOINTS.md](./API_ENDPOINTS.md) - API documentation
- [RAILWAY_SETUP.md](./RAILWAY_SETUP.md) - Railway deployment guide
- [RAILWAY_SETUP_RU.md](./RAILWAY_SETUP_RU.md) - Railway setup (Russian)

## License

MIT License
