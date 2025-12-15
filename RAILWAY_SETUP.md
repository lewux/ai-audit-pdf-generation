# Railway Setup Guide

## Project Optimizations

This project is optimized for Railway deployment with focus on build speed and security.

## Railway Configuration

### 1. Environment Variables (REQUIRED)

Add these in Railway Dashboard → Variables:

#### Required:
```
NODE_ENV=production
PORT=3001
JWT_SECRET=<generate: openssl rand -base64 32>
API_CLIENT_ID=<your client id, e.g.: my-wordpress-site>
API_CLIENT_SECRET=<generate: openssl rand -base64 32>
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

#### Optional (for optimization):
```
PUPPETEER_CACHE_DIR=/tmp/.cache/puppeteer
NPM_CONFIG_CACHE=/tmp/.npm
AUTH_RATE_LIMIT=5
API_RATE_LIMIT=10
JWT_EXPIRY=24h
```

### 2. Generate Credentials

**On macOS/Linux:**
```bash
# For JWT_SECRET
openssl rand -base64 32

# For API_CLIENT_SECRET
openssl rand -base64 32
```

**Or using Node.js:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 3. Build Settings

Railway will automatically detect `railway.json` and use optimized settings:

- **Builder**: NIXPACKS (auto-detects Node.js)
- **Build Command**: `npm ci --prefer-offline --no-audit` (fast install)
- **Start Command**: `npm start`

#### Build Settings in Dashboard:
1. **Build Command**: Leave empty (Railway uses `railway.json`)
2. **Start Command**: Leave empty (Railway uses `railway.json`)

### 4. Resource Settings

- **Memory**: Minimum 512MB (recommended 1GB for Puppeteer)
- **CPU**: Standard plan

### 5. Deployment Settings

- **Auto Deploy**: Enabled (auto-deploy on push to main)
- **Branch**: `main` (or your main branch)

## 🔐 Security Features

### Authentication Protection:

1. **Required credentials** - tokens require valid `client_id` and `client_secret`
2. **Strict rate limiting** - 5 token attempts per 15 minutes
3. **JWT expiration** - tokens expire after 24 hours
4. **Env-based secrets** - credentials stored only in Railway, not in code

### Getting a Token:

```bash
curl -X POST https://ai-audit-pdf-generation-production.up.railway.app/api/auth/token \
  -H "Content-Type: application/json" \
  -d '{
    "client_id": "your-client-id",
    "client_secret": "your-client-secret"
  }'
```

## Project Optimizations

### Configuration Files:
- `.railwayignore` - excludes unnecessary files from deploy
- `.npmrc` - optimizes npm package installation
- `railway.json` - build and deploy settings

### Puppeteer Optimizations:
- Uses `--single-process` for Railway (less memory)
- Unnecessary browser features disabled
- Chromium cached in `/tmp/.cache/puppeteer`

## Monitoring Build

To track build time:
1. Go to Railway Dashboard
2. Open your project
3. "Deployments" tab shows build time for each deploy

## Expected Build Times

After optimization:
- **First build**: 3-5 minutes (downloading Chromium)
- **Subsequent builds**: 1-2 minutes (with cache)

## Troubleshooting

### Slow build (>5 minutes):
- Check that `.railwayignore` properly excludes files
- Ensure `package-lock.json` is committed
- Check repository size (should be < 100MB without node_modules)

### Puppeteer errors:
- Ensure enough memory is allocated (minimum 512MB)
- Check `PUPPETEER_CACHE_DIR` environment variable

### "Invalid credentials":
- Check `API_CLIENT_ID` and `API_CLIENT_SECRET` in Railway Variables
- Ensure you're using correct values in requests

### "Too many authentication attempts":
- Rate limiting: wait 15 minutes
- Or increase `AUTH_RATE_LIMIT` in variables

### Dependency installation errors:
- Check `.npmrc` file
- Ensure Node.js version is compatible (>= 18.0.0)

## Additional Optimizations

### Railway Build Cache:
Railway automatically caches:
- `node_modules/` between builds
- Chromium from Puppeteer (if `PUPPETEER_CACHE_DIR` is set)

### Monitoring:
- Use Railway Metrics to track resource usage
- Set up alerts when limits are exceeded

## Documentation

- `AUTH_ENDPOINTS.md` - Authentication documentation
- `API_ENDPOINTS.md` - API documentation
- `QUICK_START.md` - Quick start guide
