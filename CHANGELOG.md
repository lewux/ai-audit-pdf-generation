# Changelog

All notable changes to this project will be documented in this file.

## [1.1.0] - 2025-10-22

### Added
- **Authentication Endpoints** - New `/api/auth` routes for JWT token management
  - `POST /api/auth/token` - Generate new JWT tokens
  - `GET /api/auth/verify` - Verify token validity
  - `POST /api/auth/refresh` - Refresh existing tokens
- **Test Mode** - Easy token generation in development without credentials
- **Production Mode** - Secure token generation using client credentials
- **Helper Scripts**:
  - `get-token.sh` - Quick token generation script
  - `test-auth.sh` - Complete authentication testing suite
- **Documentation**:
  - `AUTH_ENDPOINTS.md` - Complete authentication documentation
  - `QUICK_START.md` - Quick start guide with examples
  - `CHANGELOG.md` - This file

### Changed
- Updated `server.js` to include authentication routes
- Updated `README.md` to reference authentication endpoints
- Enhanced `.env` with optional API credentials

### Security
- Implemented secure JWT token generation and verification
- Support for bcrypt-hashed client secrets
- Token expiration (24 hours default, configurable)
- Optional client credential validation for production

## [1.0.0] - 2025-09-29

### Initial Release
- PDF generation server with Puppeteer
- Express.js REST API
- JWT authentication middleware
- Rate limiting
- Input validation with Joi
- File management and cleanup
- Health check endpoints
- PM2 process management support
- WordPress integration ready
- Comprehensive documentation





