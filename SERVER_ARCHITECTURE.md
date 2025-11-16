# 🏗️ AI Audit PDF Server - Architecture & Flow

## 📊 System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    AI AUDIT PDF SERVER                         │
│                      (Express.js)                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT REQUESTS                         │
│  • WordPress Plugin                                             │
│  • Postman Testing                                              │
│  • Direct API Calls                                             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      MIDDLEWARE LAYER                          │
│  • CORS (Cross-Origin Resource Sharing)                        │
│  • Helmet (Security Headers)                                   │
│  • Morgan (Request Logging)                                    │
│  • Rate Limiting (100 req/15min)                               │
│  • JWT Authentication                                           │
│  • Input Validation (Joi)                                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         API ROUTES                             │
│                                                                 │
│  GET  /api/health          → Health Check (No Auth)            │
│  POST /api/pdf            → Generate PDF (Auth Required)       │
│  GET  /api/download/:file → Download PDF (Auth Required)       │
│  GET  /api/download/info  → File Info (Auth Required)          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       SERVICE LAYER                            │
│                                                                 │
│  📄 PDF Generator Service                                       │
│     ├── Data Normalization                                      │
│     ├── Template Processing                                     │
│     ├── HTML Generation                                         │
│     └── Puppeteer PDF Creation                                  │
│                                                                 │
│  ✅ Data Validator Service                                       │
│     ├── Input Schema Validation                                 │
│     ├── Data Sanitization                                       │
│     └── Error Handling                                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        TEMPLATE SYSTEM                         │
│                                                                 │
│  📁 templates/                                                  │
│     ├── template.html        → Main HTML Template              │
│     ├── style.css           → CSS Styles                       │
│     ├── assets/             → Images, Icons, Graphics          │
│     └── fonts/              → Custom Fonts                     │
│                                                                 │
│  🔄 Template Processing:                                        │
│     1. Load HTML template                                       │
│     2. Replace {{variables}} with audit data                   │
│     3. Generate dynamic sections (recommendations, charts)      │
│     4. Inject JavaScript data for charts                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       PDF GENERATION                           │
│                                                                 │
│  🌐 Puppeteer Browser Engine                                    │
│     ├── Launch Headless Chrome                                  │
│     ├── Load Processed HTML                                     │
│     ├── Wait for Assets/Fonts to Load                           │
│     ├── Generate PDF with Custom Settings                       │
│     └── Save to Uploads Directory                               │
│                                                                 │
│  📄 PDF Settings:                                               │
│     • Format: A4                                                │
│     • Quality: 80%                                              │
│     • Background: Enabled                                       │
│     • Margins: 0 (Full Page)                                    │
│     • Print CSS: Enabled                                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        FILE SYSTEM                             │
│                                                                 │
│  📁 uploads/                                                    │
│     ├── report-YYYYMMDD-HHMMSS.pdf → Generated PDFs            │
│     ├── assets/                → Copied Template Assets        │
│     ├── fonts/                 → Copied Template Fonts         │
│     └── debug.html             → Generated HTML (Debug)        │
│                                                                 │
│  📁 logs/                                                       │
│     ├── app.log              → Application Logs                │
│     ├── err.log              → Error Logs                      │
│     └── out.log              → Output Logs                     │
└─────────────────────────────────────────────────────────────────┘
```

## 🔄 Complete Request Flow

### 1. **Client Request**
```
POST /api/pdf
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "data": {
    "general_info": { ... },
    "lighthouse_scores": { ... },
    "performance_metrics": { ... },
    "seo_analysis": { ... },
    "accessibility_best_practices": { ... },
    "final_conclusion": { ... }
  }
}
```

### 2. **Middleware Processing**
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│    CORS     │ -> │   Helmet    │ -> │   Morgan    │ -> │ Rate Limit  │
│   Headers   │    │  Security   │    │   Logging   │    │  Checking   │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       │
       ▼
┌─────────────┐    ┌─────────────┐
│    JWT      │ -> │ Validation  │
│    Auth     │    │   (Joi)     │
└─────────────┘    └─────────────┘
```

### 3. **Route Handler**
```javascript
// routes/generate.js
router.post('/', async (req, res) => {
  // 1. Validate input data
  const validationResult = validateAuditData(req.body.data);
  
  // 2. Generate PDF
  const generator = new PDFGenerator();
  const result = await generator.generateFromData(req.body.data);
  
  // 3. Return response
  res.json({
    success: true,
    pdf_url: result.url,
    pdf_path: result.path,
    file_size: result.size,
    generation_time: result.duration
  });
});
```

### 4. **PDF Generation Process**
```javascript
// services/pdf-generator.js
async generateFromData(data) {
  // 1. Normalize data structure
  const normalizedData = this.normalizeLewuxJson(data);
  
  // 2. Load HTML template
  const template = await this.loadTemplate();
  
  // 3. Process template variables
  const processedHtml = this.replaceTemplateVariables(template, normalizedData);
  
  // 4. Copy assets to output directory
  await this.copyAssets();
  
  // 5. Generate PDF with Puppeteer
  await this.generatePDF(processedHtml, outputPath);
  
  return result;
}
```

### 5. **Template Processing**
```javascript
replaceTemplateVariables(template, data) {
  // 1. Replace {{variable}} placeholders
  html = replaceAllVariables(html, data);
  
  // 2. Generate dynamic sections
  const performanceHtml = makeCards(data.performanceRecommendations);
  const seoHtml = makeCards(data.seoRecommendationsArr);
  
  // 3. Conditional rendering
  if (!performanceHtml) {
    html = html.replace(/<!-- Performance -->[\s\S]*?<!-- SEO -->/, '<!-- SEO -->');
  }
  
  // 4. Inject chart data
  html = html.replace('</body>', `
    <script>
      window.lighthouseMetrics = ${JSON.stringify(data.lighthouseMetrics)};
      window.chartDataMobile = ${JSON.stringify(data.chartDataMobile)};
    </script>
  `);
  
  return html;
}
```

### 6. **Puppeteer PDF Generation**
```javascript
async generatePDF(html, outputPath) {
  // 1. Launch browser
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  // 2. Create page
  const page = await browser.newPage();
  await page.setViewport({ width: 794, height: 2000 });
  
  // 3. Load HTML
  await page.goto(`file://${htmlPath}`);
  
  // 4. Wait for assets
  await page.waitForTimeout(3000);
  
  // 5. Generate PDF
  await page.pdf({
    path: outputPath,
    format: 'A4',
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 }
  });
  
  await browser.close();
}
```

## 📁 File Structure

```
pdf-server/
├── 📄 server.js                 # Main Express server
├── 📦 package.json              # Dependencies & scripts
├── 🔧 .env                      # Environment variables
├── 📚 README.md                 # Documentation
├── 📋 API_ENDPOINTS.md          # API documentation
├── 📮 Postman_Collection.json   # Postman import file
├── 🌍 Postman_Environment.json  # Postman environment
│
├── 📁 routes/                   # API endpoint handlers
│   ├── 📄 health.js            # Health check endpoint
│   ├── 📄 generate.js          # PDF generation endpoint
│   └── 📄 download.js          # File download endpoints
│
├── 📁 services/                 # Business logic
│   ├── 📄 pdf-generator.js     # Core PDF generation
│   └── 📄 data-validator.js    # Input validation
│
├── 📁 middleware/               # Express middleware
│   ├── 📄 auth.js              # JWT authentication
│   ├── 📄 rate-limit.js        # Rate limiting
│   └── 📄 validation.js        # Input validation schemas
│
├── 📁 templates/                # HTML templates & assets
│   ├── 📄 template.html        # Main HTML template
│   ├── 📄 style.css           # CSS styles
│   ├── 📁 assets/             # Images, icons, graphics
│   │   ├── 🖼️ *.svg           # Vector icons
│   │   └── 🖼️ *.png           # Raster images
│   └── 📁 fonts/              # Custom fonts
│       └── 🔤 *.OTF           # OpenType fonts
│
├── 📁 uploads/                  # Generated files
│   ├── 📄 *.pdf               # Generated PDF reports
│   ├── 📁 assets/             # Copied template assets
│   ├── 📁 fonts/              # Copied template fonts
│   └── 📄 debug.html          # Generated HTML (debug)
│
├── 📁 logs/                     # Application logs
│   ├── 📄 app.log             # Application logs
│   ├── 📄 err.log             # Error logs
│   └── 📄 out.log             # Output logs
│
└── 📁 test files/               # Testing utilities
    ├── 📄 test-generate.js    # PDF generation test
    ├── 📄 generate-token.js   # JWT token generator
    └── 📄 test-api.sh         # API testing script
```

## 🔐 Security Features

### **Authentication & Authorization**
- JWT token-based authentication
- Token expiration (24 hours)
- Secure token validation

### **Rate Limiting**
- 100 requests per 15 minutes
- Configurable limits
- IP-based tracking

### **Input Validation**
- Joi schema validation
- Data sanitization
- Required field checking

### **Security Headers**
- Helmet security middleware
- CORS protection
- XSS protection
- CSRF protection

### **File Security**
- Path traversal protection
- File type validation
- Size limits (50MB max)
- Automatic cleanup (30 days)

## 🚀 Performance Features

### **PDF Generation**
- Puppeteer optimization
- Asset caching
- Parallel processing
- Memory management

### **File Management**
- Unique filename generation
- Organized directory structure
- Automatic asset copying
- Debug HTML generation

### **Monitoring**
- Request logging (Morgan)
- Health check endpoint
- Memory usage tracking
- Response time monitoring

## 📊 Data Flow Summary

```
Input Data → Validation → Normalization → Template Processing → 
HTML Generation → Puppeteer → PDF Output → File Storage → 
Download URL Response
```

## 🔄 Error Handling

### **Validation Errors (400)**
- Missing required fields
- Invalid data types
- Schema violations

### **Authentication Errors (401/403)**
- Missing token
- Invalid token
- Expired token

### **Rate Limit Errors (429)**
- Too many requests
- Configurable limits

### **Server Errors (500)**
- PDF generation failures
- File system errors
- Puppeteer crashes

## 📈 Monitoring & Logging

### **Health Monitoring**
- Server uptime
- Memory usage
- Response times
- Error rates

### **Request Logging**
- All API requests
- Response codes
- Processing times
- User agents

### **Error Tracking**
- Validation failures
- Authentication issues
- PDF generation errors
- File system problems

This architecture provides a robust, scalable, and secure PDF generation service that can handle multiple concurrent requests while maintaining high performance and reliability.





