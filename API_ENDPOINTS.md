# 🚀 AI Audit PDF Server - API Endpoints

**Server Base URL:** `http://localhost:3001`

## 🔑 Authentication

All endpoints except health check require JWT authentication:

```bash
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ0ZXN0LXVzZXIiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NTkxNTk0MzcsImV4cCI6MTc1OTI0NTgzN30.4kIMfvQXSmjJz65TTT3ZVjWxxXLN56wBtkp1-oVFi1E
```

## 📋 Available Endpoints

### 1. Health Check
**GET** `/api/health`

No authentication required.

```bash
curl http://localhost:3001/api/health
```

**Response:**
```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2025-09-29T15:24:37.123Z",
  "uptime": 123,
  "memory": {
    "used": "19 MB",
    "total": "35 MB"
  },
  "environment": "development",
  "version": "1.0.0"
}
```

### 2. Generate PDF
**POST** `/api/pdf`

Generate a PDF report from audit data.

**Headers:**
```bash
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN
```

**Request Body:**
```json
{
  "data": {
    "general_info": {
      "site_name": "Your Site Name",
      "site_url": "https://yoursite.com",
      "audit_date": "2025-09-29",
      "site_description": "Your site description"
    },
    "lighthouse_scores": {
      "mobile": {
        "total_score": 85,
        "performance": 88,
        "accessibility": 95,
        "best_practices": 92,
        "seo": 65,
        "summary": "Good performance with room for SEO improvement"
      },
      "desktop": {
        "total_score": 90,
        "performance": 95,
        "accessibility": 98,
        "best_practices": 95,
        "seo": 70,
        "summary": "Excellent performance, focus on SEO optimization"
      }
    },
    "performance_metrics": {
      "mobile": {
        "fcp": "2.8 s",
        "lcp": "3.2 s",
        "tbt": "50 ms",
        "cls": "0.018",
        "si": "2.9 s"
      },
      "desktop": {
        "fcp": "0.9 s",
        "lcp": "1.2 s",
        "tbt": "15 ms",
        "cls": "0.001",
        "si": "1.0 s"
      },
      "recommendations": [
        "Optimize images for faster loading",
        "Implement caching strategies",
        "Minimize JavaScript execution time"
      ]
    },
    "seo_analysis": {
      "metrics": {
        "hreflang": 1,
        "canonical": 1,
        "image_alt": 0,
        "link_text": 0,
        "is_crawlable": 1,
        "document_title": 1,
        "structured_data": 0,
        "meta_description": 0
      },
      "recommendations": [
        "Add alt attributes to all images",
        "Improve link text descriptions",
        "Implement structured data markup",
        "Add meta descriptions to all pages"
      ]
    },
    "accessibility_best_practices": {
      "accessibility_score": "95 out of 100",
      "best_practices_score": "92 out of 100",
      "accessibility_metrics": {
        "color_contrast": 1,
        "aria_attributes": 1,
        "semantic_elements": 0
      },
      "best_practices_metrics": {
        "https": 1,
        "deprecations": 1,
        "errors_in_console": 0,
        "third_party_cookies": 1
      },
      "recommendations": [
        "Add semantic HTML elements",
        "Fix console errors",
        "Ensure all interactive elements have proper focus indicators"
      ]
    },
    "final_conclusion": {
      "main_recommendations": [
        "Prioritize SEO improvements for better search visibility",
        "Address accessibility issues for inclusive design",
        "Continue monitoring performance metrics"
      ],
      "next_steps": "Focus on the identified SEO and accessibility improvements to enhance overall site quality and user experience."
    }
  }
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3001/api/pdf \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ0ZXN0LXVzZXIiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NTkxNTk0MzcsImV4cCI6MTc1OTI0NTgzN30.4kIMfvQXSmjJz65TTT3ZVjWxxXLN56wBtkp1-oVFi1E" \
  -d '{
    "data": {
      "general_info": {
        "site_name": "Test Site",
        "site_url": "https://test.com",
        "audit_date": "2025-09-29",
        "site_description": "Test description"
      },
      "lighthouse_scores": {
        "mobile": {
          "total_score": 85,
          "performance": 88,
          "accessibility": 95,
          "best_practices": 92,
          "seo": 65,
          "summary": "Good performance"
        },
        "desktop": {
          "total_score": 90,
          "performance": 95,
          "accessibility": 98,
          "best_practices": 95,
          "seo": 70,
          "summary": "Excellent performance"
        }
      },
      "performance_metrics": {
        "mobile": {
          "fcp": "2.8 s",
          "lcp": "3.2 s",
          "tbt": "50 ms",
          "cls": "0.018",
          "si": "2.9 s"
        },
        "desktop": {
          "fcp": "0.9 s",
          "lcp": "1.2 s",
          "tbt": "15 ms",
          "cls": "0.001",
          "si": "1.0 s"
        },
        "recommendations": [
          "Optimize images for faster loading"
        ]
      },
      "seo_analysis": {
        "metrics": {
          "hreflang": 1,
          "canonical": 1,
          "image_alt": 0,
          "link_text": 0
        },
        "recommendations": [
          "Add alt attributes to all images"
        ]
      },
      "accessibility_best_practices": {
        "accessibility_score": "95 out of 100",
        "best_practices_score": "92 out of 100",
        "accessibility_metrics": {
          "color_contrast": 1,
          "aria_attributes": 1,
          "semantic_elements": 0
        },
        "best_practices_metrics": {
          "https": 1,
          "deprecations": 1,
          "errors_in_console": 0,
          "third_party_cookies": 1
        },
        "recommendations": [
          "Add semantic HTML elements"
        ]
      },
      "final_conclusion": {
        "main_recommendations": [
          "Prioritize SEO improvements"
        ],
        "next_steps": "Focus on SEO improvements"
      }
    }
  }'
```

**Response:**
```json
{
  "success": true,
  "pdf_path": "/app/uploads/report-20251215-160822-a1b2c3d4.pdf",
  "file_name": "report-20251215-160822-a1b2c3d4.pdf",
  "file_size": 2267646,
  "generation_time": "7348ms"
}
```

> **Note:** File names include a random hash for security. Use `file_name` with `/api/download/{file_name}` to download the PDF.

### 3. Download PDF File
**GET** `/api/download/:filename`

Download a generated PDF file.

**Headers:**
```bash
Authorization: Bearer YOUR_JWT_TOKEN
```

**cURL Example:**
```bash
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ0ZXN0LXVzZXIiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NTkxNTk0MzcsImV4cCI6MTc1OTI0NTgzN30.4kIMfvQXSmjJz65TTT3ZVjWxxXLN56wBtkp1-oVFi1E" \
  -O http://localhost:3001/api/download/report-20250929-182224.pdf
```

**Response:** Binary PDF file download

### 4. Get File Information
**GET** `/api/download/info/:filename`

Get information about a generated PDF file without downloading it.

**Headers:**
```bash
Authorization: Bearer YOUR_JWT_TOKEN
```

**cURL Example:**
```bash
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ0ZXN0LXVzZXIiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NTkxNTk0MzcsImV4cCI6MTc1OTI0NTgzN30.4kIMfvQXSmjJz65TTT3ZVjWxxXLN56wBtkp1-oVFi1E" \
  http://localhost:3001/api/download/info/report-20250929-182224.pdf
```

**Response:**
```json
{
  "success": true,
  "filename": "report-20250929-182224.pdf",
  "size": 2267646,
  "created": "2025-09-29T15:22:31.635Z",
  "modified": "2025-09-29T15:22:31.711Z"
}
```

## 🔧 Server Management

### Start Server
```bash
cd pdf-server
npm start
# or for development
npm run dev
```

### Generate JWT Token
```bash
node generate-token.js
```

### Test PDF Generation
```bash
npm test
```

### Test Full API
```bash
./test-api.sh
```

## 📝 Data Structure Requirements

The `data` object in your POST request should include:

- **general_info**: Site name, URL, audit date, description
- **lighthouse_scores**: Mobile and desktop scores for performance, accessibility, best practices, SEO
- **performance_metrics**: Web vitals data (FCP, LCP, TBT, CLS, SI) and recommendations
- **seo_analysis**: SEO metrics (0 or 1 for pass/fail) and recommendations
- **accessibility_best_practices**: Accessibility and best practices scores and recommendations
- **final_conclusion**: Main recommendations and next steps

## ⚠️ Error Responses

### Authentication Error (401)
```json
{
  "success": false,
  "error": "Access token required"
}
```

### Invalid Token (403)
```json
{
  "success": false,
  "error": "Invalid or expired token"
}
```

### Rate Limit Exceeded (429)
```json
{
  "success": false,
  "error": "Too many requests, please try again later"
}
```

### Validation Error (400)
```json
{
  "success": false,
  "error": "Invalid data format",
  "details": ["site_name is required"]
}
```

### Server Error (500)
```json
{
  "success": false,
  "error": "Internal server error"
}
```

## 🌐 WordPress Integration Example

```php
<?php
define('PDF_SERVER_URL', 'https://your-server.railway.app');
define('PDF_CLIENT_ID', 'your-client-id');
define('PDF_CLIENT_SECRET', 'your-client-secret');

/**
 * Get or refresh API token (cached for 24 hours)
 */
function lewux_get_api_token() {
    $token = get_transient('lewux_pdf_token');
    
    if ($token) {
        return $token;
    }
    
    $response = wp_remote_post(PDF_SERVER_URL . '/api/auth/token', [
        'headers' => ['Content-Type' => 'application/json'],
        'body' => json_encode([
            'client_id' => PDF_CLIENT_ID,
            'client_secret' => PDF_CLIENT_SECRET
        ]),
        'timeout' => 10
    ]);
    
    if (is_wp_error($response)) {
        return false;
    }
    
    $data = json_decode(wp_remote_retrieve_body($response), true);
    
    if (!empty($data['token'])) {
        // Cache token for 23 hours (1 hour buffer before expiry)
        set_transient('lewux_pdf_token', $data['token'], 23 * HOUR_IN_SECONDS);
        return $data['token'];
    }
    
    return false;
}

/**
 * Generate PDF and return file info
 */
function lewux_generate_pdf($audit_data) {
    $token = lewux_get_api_token();
    
    if (!$token) {
        return ['error' => 'Failed to get API token'];
    }
    
    $response = wp_remote_post(PDF_SERVER_URL . '/api/pdf', [
        'headers' => [
            'Content-Type' => 'application/json',
            'Authorization' => 'Bearer ' . $token
        ],
        'body' => json_encode(['data' => $audit_data]),
        'timeout' => 60
    ]);
    
    if (is_wp_error($response)) {
        return ['error' => $response->get_error_message()];
    }
    
    return json_decode(wp_remote_retrieve_body($response), true);
}

/**
 * Download PDF and attach to email
 */
function lewux_send_pdf_email($to, $subject, $audit_data) {
    $result = lewux_generate_pdf($audit_data);
    
    if (!$result['success']) {
        return false;
    }
    
    $token = lewux_get_api_token();
    $pdf_url = PDF_SERVER_URL . '/api/download/' . $result['file_name'];
    
    // Download PDF to temp file
    $response = wp_remote_get($pdf_url, [
        'headers' => ['Authorization' => 'Bearer ' . $token],
        'timeout' => 30
    ]);
    
    if (is_wp_error($response)) {
        return false;
    }
    
    $temp_file = wp_tempnam($result['file_name']);
    file_put_contents($temp_file, wp_remote_retrieve_body($response));
    
    // Send email with attachment
    $sent = wp_mail(
        $to,
        $subject,
        'Please find your audit report attached.',
        ['Content-Type: text/html; charset=UTF-8'],
        [$temp_file]
    );
    
    // Cleanup
    @unlink($temp_file);
    
    return $sent;
}
```





