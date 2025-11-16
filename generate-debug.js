const PDFGenerator = require('./services/pdf-generator');
const fs = require('fs-extra');
const path = require('path');

async function generateDebugTemplate() {
    try {
        console.log('🚀 Generating debug template with sample data...');
        
        // Sample audit data
        const sampleData = {
            general_info: {
                site_name: "Debug Test Site",
                site_url: "https://debug-test.com",
                audit_date: new Date().toISOString().split('T')[0],
                site_description: "This is a debug template preview with sample data"
            },
            lighthouse_scores: {
                mobile: {
                    total_score: 85,
                    performance: 88,
                    accessibility: 95,
                    best_practices: 92,
                    seo: 65,
                    summary: "Good performance with room for SEO improvement"
                },
                desktop: {
                    total_score: 90,
                    performance: 95,
                    accessibility: 98,
                    best_practices: 95,
                    seo: 70,
                    summary: "Excellent performance, focus on SEO optimization"
                }
            },
            performance_metrics: {
                mobile: {
                    fcp: "2.8 s",
                    lcp: "3.2 s",
                    tbt: "50 ms",
                    cls: "0.018",
                    si: "2.9 s"
                },
                desktop: {
                    fcp: "0.9 s",
                    lcp: "1.2 s",
                    tbt: "15 ms",
                    cls: "0.001",
                    si: "1.0 s"
                },
                recommendations: [
                    "Optimize images for faster loading",
                    "Implement caching strategies",
                    "Minimize JavaScript execution time",
                    "Use modern image formats like WebP"
                ]
            },
            seo_analysis: {
                metrics: {
                    hreflang: 1,
                    canonical: 1,
                    image_alt: 0,
                    link_text: 0,
                    is_crawlable: 1,
                    document_title: 1,
                    structured_data: 0,
                    meta_description: 0
                },
                recommendations: [
                    "Add alt attributes to all images",
                    "Improve link text descriptions",
                    "Implement structured data markup",
                    "Add meta descriptions to all pages"
                ]
            },
            accessibility_best_practices: {
                accessibility_score: "95 out of 100",
                best_practices_score: "92 out of 100",
                accessibility_metrics: {
                    color_contrast: 1,
                    aria_attributes: 1,
                    semantic_elements: 0
                },
                best_practices_metrics: {
                    https: 1,
                    deprecations: 1,
                    errors_in_console: 0,
                    third_party_cookies: 1
                },
                recommendations: [
                    "Add semantic HTML elements",
                    "Fix console errors",
                    "Ensure all interactive elements have proper focus indicators"
                ]
            },
            final_conclusion: {
                main_recommendations: [
                    "Prioritize SEO improvements for better search visibility",
                    "Address accessibility issues for inclusive design",
                    "Continue monitoring performance metrics"
                ],
                next_steps: "Focus on the identified SEO and accessibility improvements to enhance overall site quality and user experience."
            }
        };

        // Create PDF generator instance
        const generator = new PDFGenerator();
        
        // Generate the processed HTML (without creating PDF)
        const normalizedData = generator.normalizeLewuxJson(sampleData);
        const template = await generator.loadTemplate();
        const processedHtml = generator.replaceTemplateVariables(template, normalizedData);
        
        // Save debug HTML
        const debugPath = path.join(__dirname, 'uploads', 'debug.html');
        await fs.writeFile(debugPath, processedHtml, 'utf-8');
        
        console.log('✅ Debug template generated successfully!');
        console.log(`📁 File saved to: ${debugPath}`);
        console.log('🌐 Opening in browser...');
        
        // Open in browser
        const { exec } = require('child_process');
        exec(`open "${debugPath}"`, (error) => {
            if (error) {
                console.log('⚠️  Could not open automatically. Please open the file manually:');
                console.log(`   file://${debugPath}`);
            } else {
                console.log('✅ Opened in browser!');
            }
        });
        
        console.log('\n🔍 You can now:');
        console.log('   - Inspect the template in the browser');
        console.log('   - Use DevTools to modify CSS and see changes');
        console.log('   - Test different screen sizes');
        console.log('   - Check how the template looks before PDF generation');
        
    } catch (error) {
        console.error('❌ Error generating debug template:', error.message);
        console.error('Stack:', error.stack);
    }
}

generateDebugTemplate();


