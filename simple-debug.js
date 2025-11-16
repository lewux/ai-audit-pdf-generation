const puppeteer = require('puppeteer');
const fs = require('fs-extra');
const path = require('path');

async function debugTemplate() {
    let browser;
    try {
        console.log('🚀 Launching Puppeteer in debug mode...');
        
        // Launch browser with visible window
        browser = await puppeteer.launch({
            headless: false,
            devtools: true,
            slowMo: 50,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--window-size=1200,800',
                '--disable-web-security',
                '--disable-features=VizDisplayCompositor'
            ]
        });

        const page = await browser.newPage();
        
        // Set viewport
        await page.setViewport({
            width: 794,
            height: 2000,
            deviceScaleFactor: 1
        });

        // Path to your template
        const templatePath = path.join(__dirname, 'templates', 'template.html');
        const uploadsDir = path.join(__dirname, 'uploads');
        
        // Ensure uploads directory exists
        await fs.ensureDir(uploadsDir);
        
        // Copy assets
        const assetsDir = path.join(__dirname, 'templates', 'assets');
        const fontsDir = path.join(__dirname, 'templates', 'fonts');
        const outputAssetsDir = path.join(uploadsDir, 'assets');
        const outputFontsDir = path.join(uploadsDir, 'fonts');
        
        if (await fs.pathExists(assetsDir)) {
            await fs.copy(assetsDir, outputAssetsDir);
            console.log('✅ Assets copied');
        }
        
        if (await fs.pathExists(fontsDir)) {
            await fs.copy(fontsDir, outputFontsDir);
            console.log('✅ Fonts copied');
        }

        // Load template
        let template = await fs.readFile(templatePath, 'utf-8');
        
        // Simple variable replacement
        template = template.replace(/\{\{siteName\}\}/g, 'Debug Test Site');
        template = template.replace(/\{\{date\}\}/g, new Date().toISOString().split('T')[0]);
        template = template.replace(/\{\{description\}\}/g, 'This is a debug template preview');
        template = template.replace(/\{\{summary\.mobile\}\}/g, 'Debug mobile summary');
        template = template.replace(/\{\{summary\.desktop\}\}/g, 'Debug desktop summary');

        // Save processed HTML
        const debugHtmlPath = path.join(uploadsDir, 'debug.html');
        await fs.writeFile(debugHtmlPath, template, 'utf-8');
        console.log('✅ Template processed and saved to debug.html');

        // Load the processed HTML
        const fileUrl = `file://${debugHtmlPath}`;
        console.log(`🌐 Loading template from: ${fileUrl}`);
        
        await page.goto(fileUrl, {
            waitUntil: 'domcontentloaded',
            timeout: 30000
        });

        console.log('✅ Template loaded successfully!');
        console.log('🔍 You can now inspect the template in the browser window');
        console.log('⏹️  Press Ctrl+C to close the browser and exit');

        // Keep the browser open
        await new Promise(() => {});

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('Stack:', error.stack);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n👋 Closing browser and exiting...');
    process.exit(0);
});

debugTemplate();


