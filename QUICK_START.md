# Quick Start Guide

## 🔐 Get Your Bearer Token

### Prerequisites

You need valid API credentials configured on the server:
- `API_CLIENT_ID` - your client ID
- `API_CLIENT_SECRET` - your client secret

These are set in Railway environment variables (not in code).

### Get Token with cURL

```bash
curl -X POST https://ai-audit-pdf-generation-production.up.railway.app/api/auth/token \
  -H "Content-Type: application/json" \
  -d '{
    "client_id": "your-client-id",
    "client_secret": "your-client-secret"
  }'
```

Copy the `token` value from the response and use it like this:
```
Authorization: Bearer YOUR_TOKEN_HERE
```

---

## 📄 Generate a PDF

### Step 1: Get Token
```bash
TOKEN=$(curl -s -X POST https://ai-audit-pdf-generation-production.up.railway.app/api/auth/token \
  -H "Content-Type: application/json" \
  -d '{
    "client_id": "your-client-id",
    "client_secret": "your-client-secret"
  }' | jq -r '.token')
```

### Step 2: Generate PDF
```bash
curl -X POST https://ai-audit-pdf-generation-production.up.railway.app/api/pdf \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d @test-payload.json
```

### Step 3: Download PDF
```bash
curl -X GET https://ai-audit-pdf-generation-production.up.railway.app/api/download/report-XXXXXXXX.pdf \
  -H "Authorization: Bearer $TOKEN" \
  --output my-report.pdf
```

---

## 🌐 WordPress Integration

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
    
    if (!$token) {
        return false;
    }
    
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

---

## 💻 JavaScript/Node.js Integration

```javascript
const API_URL = 'https://ai-audit-pdf-generation-production.up.railway.app';

async function getToken(clientId, clientSecret) {
    const response = await fetch(`${API_URL}/api/auth/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            client_id: clientId, 
            client_secret: clientSecret 
        })
    });
    const data = await response.json();
    return data.token;
}

async function generatePDF(token, auditData) {
    const response = await fetch(`${API_URL}/api/pdf`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ data: auditData })
    });
    return await response.json();
}
```

---

## 🐍 Python Integration

```python
import requests

API_URL = 'https://ai-audit-pdf-generation-production.up.railway.app'

def get_token(client_id, client_secret):
    response = requests.post(
        f'{API_URL}/api/auth/token',
        headers={'Content-Type': 'application/json'},
        json={'client_id': client_id, 'client_secret': client_secret}
    )
    return response.json()['token']

def generate_pdf(token, audit_data):
    response = requests.post(
        f'{API_URL}/api/pdf',
        headers={
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json'
        },
        json={'data': audit_data}
    )
    return response.json()
```

---

## 🔍 Troubleshooting

### Server not responding?
```bash
curl https://ai-audit-pdf-generation-production.up.railway.app/api/health
```

### Token not working?
- Ensure you include `Bearer ` (with space) before the token
- Check token hasn't expired (24 hours default)
- Verify credentials are correct

### Rate limit exceeded?
- Token endpoint: 5 attempts per 15 minutes
- API endpoints: 10 requests per 15 minutes
- Wait 15 minutes before retrying

---

## 📚 Documentation

- [AUTH_ENDPOINTS.md](./AUTH_ENDPOINTS.md) - Authentication details
- [API_ENDPOINTS.md](./API_ENDPOINTS.md) - API documentation
- [README.md](./README.md) - General setup
