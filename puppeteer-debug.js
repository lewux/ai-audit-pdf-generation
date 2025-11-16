const puppeteer = require('puppeteer');
const path = require('path');

async function openTemplateInPuppeteer() {
    let browser;
    try {
        console.log('🚀 Launching Puppeteer...');
        
        browser = await puppeteer.launch({
            headless: false,
            devtools: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-web-security',
                '--disable-features=VizDisplayCompositor',
                '--window-size=1200,800'
            ]
        });

        const page = await browser.newPage();
        
        // Set viewport for PDF generation
        await page.setViewport({
            width: 794,
            height: 2000,
            deviceScaleFactor: 1
        });

        // Load the debug.html file
        const debugPath = path.join(__dirname, 'uploads', 'debug.html');
        const fileUrl = `file://${debugPath}`;
        
        console.log(`🌐 Loading: ${fileUrl}`);
        
        await page.goto(fileUrl, {
            waitUntil: 'domcontentloaded',
            timeout: 30000
        });

        console.log('✅ Template loaded in Puppeteer!');
        console.log('🔍 You can now inspect and modify the template');
        console.log('⏹️  Press Ctrl+C to close');

        // Keep browser open
        await new Promise(() => {});

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n👋 Closing browser...');
    process.exit(0);
});

openTemplateInPuppeteer();


