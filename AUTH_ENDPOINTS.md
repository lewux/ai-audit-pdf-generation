# Authentication API Endpoints

## Overview
The PDF server now includes authentication endpoints to generate and manage JWT tokens for API access.

## Endpoints

### 1. Generate Token

**Endpoint:** `POST /api/auth/token`

**Description:** Generate a JWT token for API authentication. Requires valid client credentials (`API_CLIENT_ID` and `API_CLIENT_SECRET` must be configured on the server).

**Security:** This endpoint is protected by strict rate limiting (5 attempts per 15 minutes) to prevent brute force attacks.

**Request Body:**
```json
{
  "client_id": "your-client-id",
  "client_secret": "your-client-secret"
}
```

**Optional Parameters:**
```json
{
  "client_id": "your-client-id",
  "client_secret": "your-client-secret",
  "userId": "custom-user-id",
  "email": "user@example.com",
  "role": "client"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": "24h"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3001/api/auth/token \
  -H "Content-Type: application/json" \
  -d '{
    "client_id": "your-client-id",
    "client_secret": "your-client-secret"
  }'
```

---

### 3. Verify Token

**Endpoint:** `GET /api/auth/verify`

**Description:** Verify if a token is valid and get its payload information.

**Headers:**
```
Authorization: Bearer <your-token>
```

**Response (Valid Token):**
```json
{
  "success": true,
  "valid": true,
  "payload": {
    "userId": "test-user",
    "email": "test@example.com",
    "role": "admin",
    "client_id": "test-client",
    "generated_at": "2025-10-22T12:35:03.404Z",
    "iat": 1761136503,
    "exp": 1761222903
  },
  "expires_at": "2025-10-23T12:35:03.000Z"
}
```

**Response (Invalid Token):**
```json
{
  "success": false,
  "valid": false,
  "error": "Invalid or expired token"
}
```

**cURL Example:**
```bash
curl -X GET http://localhost:3001/api/auth/verify \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### 4. Refresh Token

**Endpoint:** `POST /api/auth/refresh`

**Description:** Refresh an existing token to extend its expiration time.

**Headers:**
```
Authorization: Bearer <your-current-token>
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": "24h",
  "usage": "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3001/api/auth/refresh \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## Using the Token

Once you have a token, use it in the `Authorization` header for all protected endpoints:

```bash
# Generate PDF
curl -X POST http://localhost:3001/api/pdf \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d @test-payload.json

# Download PDF
curl -X GET http://localhost:3001/api/download/report-20250929-182122.pdf \
  -H "Authorization: Bearer <your-token>" \
  --output report.pdf
```

---

## Configuration

### Environment Variables

Add these to your `.env` file:

```env
# Security
JWT_SECRET=your-super-secret-jwt-key-here-min-32-chars-change-this-in-production
JWT_EXPIRY=24h

# API Client Credentials (Optional - for production)
API_CLIENT_ID=your-client-id
API_CLIENT_SECRET=your-client-secret
```

### Setting Up Production Credentials

1. Generate a strong client secret:
   ```bash
   openssl rand -base64 32
   ```

2. Add to `.env`:
   ```env
   API_CLIENT_ID=my-wordpress-site
   API_CLIENT_SECRET=your-generated-secret
   ```

3. Use these credentials to generate tokens in production mode.

---

## Security Notes

- **Credentials Required**: Client credentials (`client_id` and `client_secret`) are always required to generate tokens. Test mode has been removed for security.
- **Rate Limiting**: Token generation endpoint is protected by strict rate limiting (5 attempts per 15 minutes) to prevent brute force attacks.
- **Token Expiry**: Tokens expire after 24 hours by default (configurable via `JWT_EXPIRY`)
- **HTTPS**: Always use HTTPS in production to protect tokens in transit
- **Secret Storage**: Never commit your `JWT_SECRET` or credentials to version control
- **Environment Variables**: Set `API_CLIENT_ID` and `API_CLIENT_SECRET` in your Railway environment variables

---

## WordPress Integration Example

### PHP Example (WordPress)

```php
<?php
// Get a token
function lewux_get_api_token() {
    $response = wp_remote_post('http://localhost:3001/api/auth/token', [
        'headers' => [
            'Content-Type' => 'application/json'
        ],
        'body' => json_encode([
            'test' => true
        ])
    ]);
    
    if (is_wp_error($response)) {
        return false;
    }
    
    $body = json_decode(wp_remote_retrieve_body($response), true);
    return $body['token'] ?? false;
}

// Use the token to generate PDF
function lewux_generate_pdf($audit_data) {
    $token = lewux_get_api_token();
    
    if (!$token) {
        return false;
    }
    
    $response = wp_remote_post('http://localhost:3001/api/pdf', [
        'headers' => [
            'Authorization' => 'Bearer ' . $token,
            'Content-Type' => 'application/json'
        ],
        'body' => json_encode([
            'data' => $audit_data
        ])
    ]);
    
    if (is_wp_error($response)) {
        return false;
    }
    
    return json_decode(wp_remote_retrieve_body($response), true);
}
?>
```

---

## Testing

### Quick Test Script

Save this as `test-auth.sh`:

```bash
#!/bin/bash

# Generate token
echo "Generating token..."
TOKEN_RESPONSE=$(curl -s -X POST http://localhost:3001/api/auth/token \
  -H "Content-Type: application/json" \
  -d '{"test": true}')

echo "Token Response:"
echo $TOKEN_RESPONSE | jq '.'

# Extract token
TOKEN=$(echo $TOKEN_RESPONSE | jq -r '.token')

echo -e "\nVerifying token..."
curl -s -X GET http://localhost:3001/api/auth/verify \
  -H "Authorization: Bearer $TOKEN" | jq '.'

echo -e "\nToken is ready to use!"
echo "Authorization: Bearer $TOKEN"
```

Make it executable and run:
```bash
chmod +x test-auth.sh
./test-auth.sh
```

---

## Troubleshooting

### "Invalid or expired token"
- Check that your JWT_SECRET matches the one used to generate the token
- Verify the token hasn't expired (24 hours by default)
- Ensure you're including "Bearer " before the token

### "Access token required"
- Make sure you're including the Authorization header
- Format: `Authorization: Bearer <token>`

### "Server authentication not configured"
- In production mode without test flag, you need to set `API_CLIENT_ID` and `API_CLIENT_SECRET` in `.env`

---

## Related Documentation

- [API_ENDPOINTS.md](./API_ENDPOINTS.md) - Main API documentation
- [README.md](./README.md) - Server setup and configuration
- [SERVER_ARCHITECTURE.md](./SERVER_ARCHITECTURE.md) - Server architecture details





