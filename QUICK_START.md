# Quick Start Guide

## Get Your Bearer Token in 30 Seconds

### Method 1: Using cURL (Fastest)

```bash
curl -X POST http://localhost:3001/api/auth/token \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

Copy the `token` value from the response and use it like this:
```bash
Authorization: Bearer YOUR_TOKEN_HERE
```

### Method 2: Using the Test Script

```bash
cd /Users/smopy/www/Lewux/lewux-pdf-server/pdf-server
./test-auth.sh
```

The script will:
- ✅ Generate a token
- ✅ Verify it's valid
- ✅ Show you how to use it
- ✅ Refresh it

### Method 3: Using Postman

1. Import `Postman_Collection.json`
2. Send request to: **POST** `{{base_url}}/api/auth/token`
3. Body: `{"test": true}`
4. Copy the token from response

---

## Complete Example: Generate a PDF

### Step 1: Get Token
```bash
TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/token \
  -H "Content-Type: application/json" \
  -d '{"test": true}' | jq -r '.token')
```

### Step 2: Generate PDF
```bash
curl -X POST http://localhost:3001/api/pdf \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d @test-payload.json
```

### Step 3: Download PDF
```bash
# Get the filename from the response above, then:
curl -X GET http://localhost:3001/api/download/report-XXXXXXXX.pdf \
  -H "Authorization: Bearer $TOKEN" \
  --output my-report.pdf
```

---

## One-Line Token Generator

Save this as an alias in your `~/.zshrc` or `~/.bashrc`:

```bash
alias pdf-token='curl -s -X POST http://localhost:3001/api/auth/token -H "Content-Type: application/json" -d "{\"test\": true}" | jq -r ".token"'
```

Then just run:
```bash
pdf-token
```

Or use it directly in requests:
```bash
TOKEN=$(pdf-token)
curl -X POST http://localhost:3001/api/pdf \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d @test-payload.json
```

---

## WordPress Integration

Add this to your WordPress plugin or theme:

```php
<?php
function lewux_get_pdf_token() {
    $response = wp_remote_post('http://localhost:3001/api/auth/token', [
        'headers' => ['Content-Type' => 'application/json'],
        'body' => json_encode(['test' => true])
    ]);
    
    $body = json_decode(wp_remote_retrieve_body($response), true);
    return $body['token'] ?? false;
}

function lewux_generate_pdf($audit_data) {
    $token = lewux_get_pdf_token();
    
    $response = wp_remote_post('http://localhost:3001/api/pdf', [
        'headers' => [
            'Authorization' => 'Bearer ' . $token,
            'Content-Type' => 'application/json'
        ],
        'body' => json_encode(['data' => $audit_data])
    ]);
    
    return json_decode(wp_remote_retrieve_body($response), true);
}
?>
```

---

## JavaScript/Node.js Integration

```javascript
// Get token
async function getToken() {
    const response = await fetch('http://localhost:3001/api/auth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test: true })
    });
    const data = await response.json();
    return data.token;
}

// Generate PDF
async function generatePDF(auditData) {
    const token = await getToken();
    
    const response = await fetch('http://localhost:3001/api/pdf', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ data: auditData })
    });
    
    return await response.json();
}

// Usage
generatePDF(myAuditData)
    .then(result => console.log('PDF generated:', result.pdf_url))
    .catch(err => console.error('Error:', err));
```

---

## Python Integration

```python
import requests
import json

def get_token():
    response = requests.post(
        'http://localhost:3001/api/auth/token',
        headers={'Content-Type': 'application/json'},
        json={'test': True}
    )
    return response.json()['token']

def generate_pdf(audit_data):
    token = get_token()
    
    response = requests.post(
        'http://localhost:3001/api/pdf',
        headers={
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json'
        },
        json={'data': audit_data}
    )
    
    return response.json()

# Usage
result = generate_pdf(my_audit_data)
print(f"PDF generated: {result['pdf_url']}")
```

---

## Troubleshooting

### Server not responding?
```bash
# Check if server is running
curl http://localhost:3001/api/health

# If not, start it
cd /Users/smopy/www/Lewux/lewux-pdf-server/pdf-server
npm run dev
```

### Token not working?
- Make sure you include "Bearer " before the token
- Check token hasn't expired (24 hours)
- Verify JWT_SECRET in .env matches

### Need help?
Check the full documentation:
- [AUTH_ENDPOINTS.md](./AUTH_ENDPOINTS.md) - Authentication details
- [API_ENDPOINTS.md](./API_ENDPOINTS.md) - API documentation
- [README.md](./README.md) - General setup

---

## Production Mode

For production, set up proper credentials in `.env`:

```env
API_CLIENT_ID=your-client-id
API_CLIENT_SECRET=your-secure-secret
```

Then request tokens with credentials:
```bash
curl -X POST http://localhost:3001/api/auth/token \
  -H "Content-Type: application/json" \
  -d '{
    "client_id": "your-client-id",
    "client_secret": "your-secure-secret"
  }'
```

---

That's it! You're ready to use the PDF server. 🚀





