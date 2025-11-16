const puppeteer = require('puppeteer');
const fs = require('fs-extra');
const path = require('path');

async function debugTemplate() {
    let browser;
    try {
        console.log('🚀 Launching Puppeteer in debug mode...');
        
        // Launch browser with visible window
        browser = await puppeteer.launch({
            headless: false, // Show browser window
            devtools: true,  // Open DevTools
            slowMo: 100,     // Slow down operations for better visibility
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--window-size=1200,800'
            ]
        });

        const page = await browser.newPage();
        
        // Set viewport for PDF generation
        await page.setViewport({
            width: 794,
            height: 2000,
            deviceScaleFactor: 2
        });

        // Path to your template
        const templatePath = path.join(__dirname, 'templates', 'template.html');
        const uploadsDir = path.join(__dirname, 'uploads');
        
        // Ensure uploads directory exists
        await fs.ensureDir(uploadsDir);
        
        // Copy assets to uploads directory
        const assetsDir = path.join(__dirname, 'templates', 'assets');
        const fontsDir = path.join(__dirname, 'templates', 'fonts');
        const outputAssetsDir = path.join(uploadsDir, 'assets');
        const outputFontsDir = path.join(uploadsDir, 'fonts');
        
        if (await fs.pathExists(assetsDir)) {
            await fs.copy(assetsDir, outputAssetsDir);
            console.log('✅ Assets copied to uploads directory');
        }
        
        if (await fs.pathExists(fontsDir)) {
            await fs.copy(fontsDir, outputFontsDir);
            console.log('✅ Fonts copied to uploads directory');
        }

        // Load template with sample data
        const sampleData = {
            siteName: "Debug Test Site",
            date: new Date().toISOString().split('T')[0],
            description: "This is a debug template preview",
            summary: {
                mobile: "Debug mobile summary",
                desktop: "Debug desktop summary"
            },
            lighthouseMetrics: {
                mobile: {
                    performance: 85,
                    accessibility: 92,
                    best_practices: 88,
                    seo: 75,
                    total_score: 85
                },
                desktop: {
                    performance: 90,
                    accessibility: 95,
                    best_practices: 92,
                    seo: 80,
                    total_score: 90
                }
            },
            seoMetrics: {
                hreflang: 1,
                canonical: 1,
                image_alt: 0,
                link_text: 0,
                is_crawlable: 1,
                document_title: 1,
                structured_data: 0,
                meta_description: 0
            },
            performanceRecommendations: [
                "Optimize images for faster loading",
                "Implement caching strategies",
                "Minimize JavaScript execution time"
            ],
            seoRecommendationsArr: [
                "Add alt attributes to all images",
                "Improve link text descriptions",
                "Implement structured data markup"
            ],
            accessibilityRecommendations: [
                "Add semantic HTML elements",
                "Fix console errors",
                "Ensure proper focus indicators"
            ],
            finalRecommendations: [
                "Prioritize SEO improvements",
                "Address accessibility issues",
                "Continue monitoring performance"
            ],
            webVitals: {
                mobile: {
                    fcp: "2.8s",
                    lcp: "3.2s",
                    tbt: "50ms",
                    cls: "0.018",
                    si: "2.9s"
                },
                desktop: {
                    fcp: "0.9s",
                    lcp: "1.2s",
                    tbt: "15ms",
                    cls: "0.001",
                    si: "1.0s"
                }
            },
            chartDataMobile: {
                values: [85, 92, 88, 75],
                total: 85,
                colors: ["#3B82F6", "#06b6d4", "#A21CAF", "#ec4899"]
            },
            chartDataDesktop: {
                values: [90, 95, 92, 80],
                total: 90,
                colors: ["#3B82F6", "#06b6d4", "#A21CAF", "#ec4899"]
            },
            accessibility: {
                score: "95 out of 100",
                metrics: {
                    color_contrast: 1,
                    aria_attributes: 1,
                    semantic_elements: 0
                }
            },
            bestPractices: {
                score: "92 out of 100",
                metrics: {
                    https: 1,
                    deprecations: 1,
                    errors_in_console: 0,
                    third_party_cookies: 1
                }
            },
            nextSteps: "Focus on the identified improvements to enhance overall site quality and user experience.",
            errors: [
                {
                    title: "Missing meta descriptions",
                    description: "Add informative meta descriptions to key pages.",
                    severity: "medium"
                }
            ]
        };

        // Load and process template
        let template = await fs.readFile(templatePath, 'utf-8');
        
        // Simple variable replacement for debugging
        template = template.replace(/\{\{siteName\}\}/g, sampleData.siteName);
        template = template.replace(/\{\{date\}\}/g, sampleData.date);
        template = template.replace(/\{\{description\}\}/g, sampleData.description);
        template = template.replace(/\{\{summary\.mobile\}\}/g, sampleData.summary.mobile);
        template = template.replace(/\{\{summary\.desktop\}\}/g, sampleData.summary.desktop);
        
        // Add chart data
        template = template.replace('</body>', `
            <script>
                window.lighthouseMetrics = ${JSON.stringify(sampleData.lighthouseMetrics)};
                window.chartDataMobile = ${JSON.stringify(sampleData.chartDataMobile.values)};
                window.totalScoreMobile = ${JSON.stringify(sampleData.chartDataMobile.total)};
                window.chartDataDesktop = ${JSON.stringify(sampleData.chartDataDesktop.values)};
                window.totalScoreDesktop = ${JSON.stringify(sampleData.chartDataDesktop.total)};
                window.webVitals = ${JSON.stringify(sampleData.webVitals)};
            </script>
        </body>`);

        // Save processed HTML
        const debugHtmlPath = path.join(uploadsDir, 'debug.html');
        await fs.writeFile(debugHtmlPath, template, 'utf-8');
        console.log('✅ Template processed and saved to debug.html');

        // Load the processed HTML
        const fileUrl = `file://${debugHtmlPath}`;
        console.log(`🌐 Loading template from: ${fileUrl}`);
        
        await page.goto(fileUrl, {
            waitUntil: ['networkidle0', 'domcontentloaded']
        });

        // Wait for fonts and assets to load
        console.log('⏳ Waiting for fonts and assets to load...');
        await page.waitForTimeout(3000);

        console.log('✅ Template loaded successfully!');
        console.log('🔍 You can now inspect the template in the browser window');
        console.log('📝 Use DevTools to modify CSS and see changes in real-time');
        console.log('⏹️  Press Ctrl+C to close the browser and exit');

        // Keep the browser open until user closes it
        await new Promise(() => {});

    } catch (error) {
        console.error('❌ Error:', error);
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


