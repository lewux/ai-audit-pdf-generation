const puppeteer = require('puppeteer');
const fs = require('fs-extra');
const path = require('path');

// Universal function for accessing nested properties by path
function getByPath(obj, path) {
    return path.split('.').reduce((o, k) => (o && o[k] !== undefined ? o[k] : ''), obj);
}

// Universal function for replacing all {{...}} variables
function replaceAllVariables(html, data) {
    return html.replace(/\{\{([\w\.]+)\}\}/g, (match, path) => {
        return getByPath(data, path) ?? '';
    });
}

class PDFGenerator {
    constructor(options = {}) {
        this.templatePath = options.templatePath || path.join(__dirname, '../templates', 'template.html');
        this.outputDir = options.outputDir || path.join(__dirname, '../uploads');
        this.assetsDir = path.join(__dirname, '../templates', 'assets');
        this.fontsDir = path.join(__dirname, '../templates', 'fonts');
    }

    async generateFromData(data) {
        const startTime = Date.now();
        
        try {
            // Normalize data
            const normalizedData = this.normalizeLewuxJson(data);

            // Load template
            const template = await this.loadTemplate();

            // Process template
            const processedHtml = this.replaceTemplateVariables(template, normalizedData);

            // Generate unique filename
            const fileName = this.generateFileName();
            const outputPath = path.join(this.outputDir, fileName);

            // Ensure output directory exists
            await fs.ensureDir(this.outputDir);

            // Copy assets to output directory for PDF generation
            await this.copyAssets();

            // Generate PDF
            await this.generatePDF(processedHtml, outputPath);

            const endTime = Date.now();
            const duration = endTime - startTime;

            // Get file stats
            const stats = await fs.stat(outputPath);

            return {
                path: outputPath,
                filename: fileName,
                url: `/files/${fileName}`,
                size: stats.size,
                duration: `${duration}ms`
            };

        } catch (error) {
            throw error;
        }
    }

    generateFileName() {
        const now = new Date();
        const pad = n => n.toString().padStart(2, '0');
        return `report-${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}.pdf`;
    }

    async loadTemplate() {
        try {
            const template = await fs.readFile(this.templatePath, 'utf-8');
            return template;
        } catch (error) {
            throw error;
        }
    }

    async copyAssets() {
        try {
            const outputAssetsDir = path.join(this.outputDir, 'assets');
            const outputFontsDir = path.join(this.outputDir, 'fonts');

            if (await fs.pathExists(this.assetsDir)) {
                await fs.copy(this.assetsDir, outputAssetsDir);
            }
            if (await fs.pathExists(this.fontsDir)) {
                await fs.copy(this.fontsDir, outputFontsDir);
            }
        } catch (error) {
            // Silently continue if assets can't be copied
        }
    }

    replaceTemplateVariables(template, data) {
        let html = template;

        // Preparation of FCP values for substitution through universal mechanism
        if (data.webVitals && data.webVitals.mobile && data.webVitals.desktop) {
            data.fcpMobile = data.webVitals.mobile.fcp ? (String(data.webVitals.mobile.fcp).replace(/[^\d.,]/g, '').replace('.', ',') || '—') : '—';
            data.fcpDesktop = data.webVitals.desktop.fcp ? (String(data.webVitals.desktop.fcp).replace(/[^\d.,]/g, '').replace('.', ',') || '—') : '—';
        } else {
            data.fcpMobile = '—';
            data.fcpDesktop = '—';
        }

        // Generate HTML for Site Loading Speed description (Page 3)
        data.siteLoadingSpeedTextHtml = `<p>First Contentful Paint (FCP) measures how long it takes for the first text or image to appear on the screen. Desktop shows ${data.fcpDesktop}s while Mobile shows ${data.fcpMobile}s. Faster FCP means better user experience.</p>`;

        // Generate HTML for SEO Status List (Page 3)
        if (data.seoMetrics) {
            const seoItems = [
                { name: 'Hreflang', value: data.seoMetrics.hreflang, description: 'Language and regional targeting' },
                { name: 'Canonical', value: data.seoMetrics.canonical, description: 'Proper canonical URL implementation' },
                { name: 'Image Alt', value: data.seoMetrics.image_alt, description: 'Alt attributes for images' },
                { name: 'Link Text', value: data.seoMetrics.link_text, description: 'Descriptive link text' },
                { name: 'Is Crawlable', value: data.seoMetrics.is_crawlable, description: 'Site is accessible to search engines' },
                { name: 'Document Title', value: data.seoMetrics.document_title, description: 'Page has a proper title' },
                { name: 'Structured Data', value: data.seoMetrics.structured_data, description: 'Schema.org markup present' },
                { name: 'Meta Description', value: data.seoMetrics.meta_description, description: 'Meta description tags present' }
            ];
            
            // Sort SEO items: passed (green) items first, then failed (red) items
            const sortedSeoItems = seoItems.sort((a, b) => {
                // Items with value === 1 are passed (green), others are failed (red)
                // Sort in descending order so passed items (1) come before failed items (0)
                return (b.value === 1 ? 1 : 0) - (a.value === 1 ? 1 : 0);
            });
            
            data.seoStatusListHtml = sortedSeoItems.map(item => {
                const status = item.value === 1 ? 'passed' : 'failed';
                const iconSrc = status === 'passed' 
                    ? './assets/5ffd2b68fc15f9adabaf982bb4295c1e0d092516.svg'
                    : './assets/cf422911af64f881fd581ca2f79e280309c04173.svg';
                return `
                <div class="seo-item ${status}">
                    <div class="seo-item-header">
                        <div class="status-dot">
                            <img alt="" src="${iconSrc}">
                        </div>
                        <div class="text-item-name">
                            <p>${item.name}</p>
                        </div>
                    </div>
                    <div class="text-item-description">
                        <p>${item.description}</p>
                    </div>
                </div>`;
            }).join('');
        } else {
            data.seoStatusListHtml = '<p>No SEO metrics available</p>';
        }

        // Generate HTML for Performance Recommendations (Page 4)
        if (data.performanceRecommendations && data.performanceRecommendations.length > 0) {
            data.performanceRecsHtml = `<div class="recommendations-list">${data.performanceRecommendations.map(rec => `
                <div class="recommendation-item performance">
                    <div class="recommendation-content">
                        <div class="icon-danger">
                            <img alt="" src="./assets/ca8584d84fe8547730536d80b60cd5e071a3b80a.svg">
                        </div>
                        <div class="text-recommendation">
                            <p>${rec.description || rec.title || rec}</p>
                        </div>
                    </div>
                </div>`).join('')}</div>`;
        } else {
            data.performanceRecsHtml = '<p>No performance recommendations</p>';
        }

        // Generate HTML for SEO Recommendations (Page 4)
        if (data.seoRecommendationsArr && data.seoRecommendationsArr.length > 0) {
            data.seoRecsHtml = `<div class="recommendations-list">${data.seoRecommendationsArr.map(rec => `
                <div class="recommendation-item seo">
                    <div class="recommendation-content">
                        <div class="icon-warning">
                            <img alt="" src="./assets/587967bfa033067bc2054e8fce6d13193e9d63e1.svg">
                        </div>
                        <div class="text-recommendation">
                            <p>${rec.description || rec.title || rec}</p>
                        </div>
                    </div>
                </div>`).join('')}</div>`;
        } else {
            data.seoRecsHtml = '<p>No SEO recommendations</p>';
        }

        // Generate HTML for Accessibility Recommendations (Page 4)
        if (data.accessibilityRecommendations && data.accessibilityRecommendations.length > 0) {
            data.accessibilityRecsHtml = `<div class="recommendations-list">${data.accessibilityRecommendations.map(rec => `
                <div class="recommendation-item accessibility">
                    <div class="recommendation-content">
                        <div class="icon-warning">
                            <img alt="" src="./assets/587967bfa033067bc2054e8fce6d13193e9d63e1.svg">
                        </div>
                        <div class="text-recommendation">
                            <p>${rec.description || rec.title || rec}</p>
                        </div>
                    </div>
                </div>`).join('')}</div>`;
        } else {
            data.accessibilityRecsHtml = '<p>No accessibility recommendations</p>';
        }

        // Generate HTML for Results Description (Page 5)
        data.resultsDescriptionHtml = `<p>${data.nextSteps || 'Continue monitoring your website performance and implement the recommended improvements for better user experience and search visibility.'}</p>`;

        // Generate HTML for Final Recommendations List (Page 5)
        if (data.finalRecommendations && data.finalRecommendations.length > 0) {
            data.finalRecsListHtml = `<div class="p5-recommendations-list">${data.finalRecommendations.map(rec => `
                <div class="p5-recommendation-item">
                    <div class="p5-recommendation-content">
                        <div class="p5-icon-danger">
                            <div class="p5-icon-group">
                                <img alt="" src="./assets/587967bfa033067bc2054e8fce6d13193e9d63e1.svg">
                            </div>
                        </div>
                        <div class="p5-text-recommendation">
                            <p>${rec.description || rec.title || rec}</p>
                        </div>
                    </div>
                </div>`).join('')}</div>`;
        } else {
            data.finalRecsListHtml = '<p>No final recommendations</p>';
        }

        // Generate HTML for recommendations by categories with fallback
        const makeCards = (arr) => {
            if (!arr || arr.length === 0) {
                return '';
            }
            return arr.map(rec => {
                const desc = rec.description && rec.description.trim() ? rec.description : rec.title || '';
                return `
                <div class="bg-gradient-to-r from-neon-blue via-neon-purple to-neon-cyan p-0.5 rounded-2xl mb-2">
                    <div class="bg-[#181f2e] rounded-2xl p-3 flex items-start">
                        <div>
                            <p class="text-gray-300 mt-0.5 text-sm">${desc}</p>
                            <div class="flex gap-2 mt-1">
                                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-neon-pink/20 text-neon-pink">Impact: ${rec.impact || ''}</span>
                                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-neon-cyan/20 text-neon-cyan">Effort: ${rec.effort || ''}</span>
                            </div>
                        </div>
                    </div>
                </div>
                `;
            }).join('');
        };
        
        const performanceHtml = makeCards(data.performanceRecommendations);
        const seoHtml = makeCards(data.seoRecommendationsArr);
        const accessibilityHtml = makeCards(data.accessibilityRecommendations);
        const finalHtml = makeCards(data.finalRecommendations);

        // Conditional rendering of sections
        if (!performanceHtml) html = html.replace(/<!-- Performance recommendations -->[\s\S]*?<!-- SEO recommendations -->/, '<!-- SEO recommendations -->');
        else html = html.replace(/\{\{performanceRecommendationsHtml\}\}/g, performanceHtml);

        if (!seoHtml) html = html.replace(/<!-- SEO recommendations -->[\s\S]*?<!-- Accessibility recommendations -->/, '<!-- Accessibility recommendations -->');
        else html = html.replace(/\{\{seoRecommendationsHtml\}\}/g, seoHtml);

        if (!accessibilityHtml) html = html.replace(/<!-- Accessibility recommendations -->[\s\S]*?<!-- Final recommendations -->/, '<!-- Final recommendations -->');
        else html = html.replace(/\{\{accessibilityRecommendationsHtml\}\}/g, accessibilityHtml);

        if (!finalHtml) html = html.replace(/<!-- Final recommendations -->[\s\S]*?<!-- Next Steps -->/, '<!-- Next Steps -->');
        else html = html.replace(/\{\{finalRecommendationsHtml\}\}/g, finalHtml);

        // Accessibility & Best Practices section
        const accBlock = (data.accessibilityScoreBarHtml && data.accessibilityTextsHtml) ? `${data.accessibilityScoreBarHtml}${data.accessibilityTextsHtml}` : '';
        const bestBlock = (data.bestPracticesScoreBarHtml && data.bestPracticesTextsHtml) ? `${data.bestPracticesScoreBarHtml}${data.bestPracticesTextsHtml}` : '';
        if (!accBlock && !bestBlock) {
            html = html.replace(/<!-- Accessibility & Best Practices -->[\s\S]*?<!-- Errors -->/, '<!-- Errors -->');
        } else {
            html = html.replace(/\{\{accessibilityScoreBarHtml\}\}/g, data.accessibilityScoreBarHtml || '');
            html = html.replace(/\{\{accessibilityTextsHtml\}\}/g, data.accessibilityTextsHtml || '');
            html = html.replace(/\{\{bestPracticesScoreBarHtml\}\}/g, data.bestPracticesScoreBarHtml || '');
            html = html.replace(/\{\{bestPracticesTextsHtml\}\}/g, data.bestPracticesTextsHtml || '');
        }

        // Errors section
        const errorsHtml = (data.errors || []).length > 0 ? (data.errors || []).map(error => `
                <div class="bg-gradient-to-r from-neon-blue via-neon-purple to-neon-cyan p-0.5 rounded-2xl">
                    <div class="bg-[#181f2e] rounded-2xl p-3 flex items-start" style="page-break-inside: avoid;">
                        <svg class="w-5 h-5 text-neon-pink mr-3 drop-shadow-glow" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
                        </svg>
                        <div>
                            <h3 class="text-base font-semibold text-neon-pink">${error.title}</h3>
                            <p class="text-gray-300 mt-0.5 text-sm">${error.description}</p>
                            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-neon-pink/20 text-neon-pink mt-1">${error.severity}</span>
                        </div>
                    </div>
                </div>
            `).join('') : '';
        if (!errorsHtml) html = html.replace(/<!-- Errors -->[\s\S]*?<!-- Performance recommendations -->/, '<!-- Performance recommendations -->');
        else html = html.replace(/\{\{#each errors\}\}([\s\S]*?)\{\{\/each\}\}/g, errorsHtml);

        // Universal substitution of all variables
        html = replaceAllVariables(html, data);

        // Insert data for charts in window (for Chart.js)
        html = html.replace('</body>', `\n<script>\nwindow.lighthouseMetrics = ${JSON.stringify(data.lighthouseMetrics)};\nwindow.chartDataMobile = ${JSON.stringify(data.chartDataMobile.values)};\nwindow.totalScoreMobile = ${JSON.stringify(data.chartDataMobile.total)};\nwindow.chartDataDesktop = ${JSON.stringify(data.chartDataDesktop.values)};\nwindow.totalScoreDesktop = ${JSON.stringify(data.chartDataDesktop.total)};\nwindow.webVitals = ${JSON.stringify(data.webVitals)};\n</script>\n</body>`);

        // Wrap all content in .page
        html = `<div class="page">` + html + `</div>`;

        return html;
    }

    async generatePDF(html, outputPath) {
        let browser;
        try {
            browser = await puppeteer.launch({
                headless: true,
                devtools: false,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--no-first-run',
                    '--no-zygote',
                    '--disable-gpu'
                ]
            });

            const page = await browser.newPage();

            // Set custom page width for design
            await page.setViewport({
                width: 794,
                height: 2000,
                deviceScaleFactor: 2
            });

            // Save HTML to output directory for file:// access
            const htmlPath = path.join(this.outputDir, 'debug.html');
            await fs.writeFile(htmlPath, html, 'utf-8');

            // Load HTML using file:// URL for proper asset loading
            await page.goto(`file://${htmlPath}`, {
                waitUntil: ['networkidle0', 'domcontentloaded']
            });

            // Wait for fonts and styles to load
            await page.waitForTimeout(3000);

            // Additional time for rendering
            await page.waitForTimeout(2000);

            // PDF generation
            await page.pdf({
                path: outputPath,
                printBackground: true,
                preferCSSPageSize: true,
                margin: { top: 0, right: 0, bottom: 0, left: 0 },
                format: 'A4',
                quality: 80,
                omitBackground: false
            });

        } catch (error) {
            throw error;
        } finally {
            if (browser) {
                await browser.close();
            }
        }
    }

    // Complete normalization function from the original generate.js
    normalizeLewuxJson(data) {
        // Collect errors by categories
        const errors = [];
        // SEO errors
        if (data.seo_analysis?.metrics) {
            const seoMetrics = data.seo_analysis.metrics;
            if (seoMetrics.link_text === 0) {
                errors.push({
                    title: 'Incorrect link texts',
                    description: 'Some links have non-informative text.',
                    severity: 'medium',
                    icon: 'link'
                });
            }
            if (seoMetrics.is_crawlable === 0) {
                errors.push({
                    title: 'Site closed from indexing',
                    description: 'Check robots.txt and meta tags to open indexing.',
                    severity: 'high',
                    icon: 'robot'
                });
            }
            if (seoMetrics.meta_description === 0) {
                errors.push({
                    title: 'Missing meta descriptions',
                    description: 'Add informative meta descriptions to key pages.',
                    severity: 'medium',
                    icon: 'tag'
                });
            }
        }
        // Accessibility errors
        if (data.accessibility_best_practices?.accessibility_metrics) {
            const acc = data.accessibility_best_practices.accessibility_metrics;
            if (acc.color_contrast === 0) {
                errors.push({
                    title: 'Poor color contrast',
                    description: 'Some elements have insufficient contrast.',
                    severity: 'medium',
                    icon: 'contrast'
                });
            }
        }
        // Best practices errors
        if (data.accessibility_best_practices?.best_practices_metrics) {
            const best = data.accessibility_best_practices.best_practices_metrics;
            if (best.https === 0) {
                errors.push({
                    title: 'HTTPS missing',
                    description: 'The site does not use a secure connection.',
                    severity: 'high',
                    icon: 'security'
                });
            }
        }

        // Categorized recommendations
        const performanceRecommendations = (data.performance_metrics?.recommendations ?? []).map(text => ({
            category: 'Performance',
            title: text.split(/[.!?]/)[0],
            description: text,
            impact: 'High',
            effort: 'Medium',
        }));
        const seoRecommendationsArr = (data.seo_analysis?.recommendations ?? []).map(text => ({
            category: 'SEO',
            title: text.split(/[.!?]/)[0],
            description: text,
            impact: 'Medium',
            effort: 'Medium',
        }));
        const accessibilityRecommendations = (data.accessibility_best_practices?.recommendations ?? []).map(text => ({
            category: 'Accessibility',
            title: text.split(/[.!?]/)[0],
            description: text,
            impact: 'Medium',
            effort: 'Low',
        }));
        const finalRecommendations = (data.final_conclusion?.main_recommendations ?? []).map(text => ({
            title: text,
            description: text,
            impact: 'Medium',
            effort: 'Low',
        }));

        // Charts
        const chartDataMobile = {
            values: [
                data.lighthouse_scores?.mobile?.performance ?? 0,
                data.lighthouse_scores?.mobile?.accessibility ?? 0,
                data.lighthouse_scores?.mobile?.best_practices ?? 0,
                data.lighthouse_scores?.mobile?.seo ?? 0
            ],
            total: data.lighthouse_scores?.mobile?.total_score ?? 0,
            colors: ["#3B82F6", "#06b6d4", "#A21CAF", "#ec4899"]
        };
        const chartDataDesktop = {
            values: [
                data.lighthouse_scores?.desktop?.performance ?? 0,
                data.lighthouse_scores?.desktop?.accessibility ?? 0,
                data.lighthouse_scores?.desktop?.best_practices ?? 0,
                data.lighthouse_scores?.desktop?.seo ?? 0
            ],
            total: data.lighthouse_scores?.desktop?.total_score ?? 0,
            colors: ["#3B82F6", "#06b6d4", "#A21CAF", "#ec4899"]
        };
        const chartData = {
            values: chartDataMobile.values,
            colors: chartDataMobile.colors
        };

        // Web Vitals
        const webVitals = {
            mobile: {
                fcp: data.performance_metrics?.mobile?.fcp ?? '—',
                lcp: data.performance_metrics?.mobile?.lcp ?? '—',
                tbt: data.performance_metrics?.mobile?.tbt ?? '—',
                cls: data.performance_metrics?.mobile?.cls ?? '—',
                si: data.performance_metrics?.mobile?.si ?? '—',
            },
            desktop: {
                fcp: data.performance_metrics?.desktop?.fcp ?? '—',
                lcp: data.performance_metrics?.desktop?.lcp ?? '—',
                tbt: data.performance_metrics?.desktop?.tbt ?? '—',
                cls: data.performance_metrics?.desktop?.cls ?? '—',
                si: data.performance_metrics?.desktop?.si ?? '—',
            }
        };

        // Accessibility & Best Practices
        const accessibility = {
            score: data.accessibility_best_practices?.accessibility_score ?? '—',
            metrics: {
                color_contrast: data.accessibility_best_practices?.accessibility_metrics?.color_contrast ?? '—',
                aria_attributes: data.accessibility_best_practices?.accessibility_metrics?.aria_attributes ?? '—',
                semantic_elements: data.accessibility_best_practices?.accessibility_metrics?.semantic_elements ?? '—',
            },
            recommendations: data.accessibility_best_practices?.recommendations ?? []
        };
        const bestPractices = {
            score: data.accessibility_best_practices?.best_practices_score ?? '—',
            metrics: {
                https: data.accessibility_best_practices?.best_practices_metrics?.https ?? '—',
                deprecations: data.accessibility_best_practices?.best_practices_metrics?.deprecations ?? '—',
                errors_in_console: data.accessibility_best_practices?.best_practices_metrics?.errors_in_console ?? '—',
                third_party_cookies: data.accessibility_best_practices?.best_practices_metrics?.third_party_cookies ?? '—',
            },
            recommendations: data.accessibility_best_practices?.recommendations ?? []
        };

        // Generate HTML for accessibility score bar
        const accScoreStr = accessibility.score || '';
        const accScoreMatch = accScoreStr.match(/(\d+)/);
        const accScore = accScoreMatch ? Number(accScoreMatch[1]) : 0;
        const accessibilityScoreBarHtml = `<div class="mb-4">
            <div class="flex justify-between items-center mb-1">
                <span class="text-sm font-medium text-neon-cyan">Average: ${accScore} out of 100</span>
            </div>
            <div class="relative h-4 rounded-full overflow-hidden bg-[#23293a]">
                <div class="absolute left-0 top-0 h-4 bg-neon-cyan" style="width: ${accScore}%;"></div>
            </div>
        </div>`;

        // Generate HTML for best practices score bar
        const bestScoreStr = bestPractices.score || '';
        const bestScoreMatch = bestScoreStr.match(/(\d+)/);
        const bestScore = bestScoreMatch ? Number(bestScoreMatch[1]) : 0;
        const bestPracticesScoreBarHtml = `<div class="mb-4">
            <div class="flex justify-between items-center mb-1">
                <span class="text-sm font-medium text-neon-pink">Average: ${bestScore} out of 100</span>
            </div>
            <div class="relative h-4 rounded-full overflow-hidden bg-[#23293a]">
                <div class="absolute left-0 top-0 h-4 bg-neon-pink" style="width: ${bestScore}%;"></div>
            </div>
        </div>`;

        // Generate basic texts for accessibility and best practices
        const accessibilityTextsHtml = '<div class="text-gray-300">Accessibility metrics evaluation completed.</div>';
        const bestPracticesTextsHtml = '<div class="text-gray-300">Best practices evaluation completed.</div>';

        return {
            siteName: data.general_info?.site_name ?? "",
            date: data.general_info?.audit_date ?? "",
            description: data.general_info?.site_description ?? "",
            summary: {
                mobile: data.lighthouse_scores?.mobile?.summary ?? "",
                desktop: data.lighthouse_scores?.desktop?.summary ?? ""
            },
            lighthouseMetrics: {
                mobile: {
                    performance: data.lighthouse_scores?.mobile?.performance ?? 0,
                    accessibility: data.lighthouse_scores?.mobile?.accessibility ?? 0,
                    best_practices: data.lighthouse_scores?.mobile?.best_practices ?? 0,
                    seo: data.lighthouse_scores?.mobile?.seo ?? 0,
                    total_score: data.lighthouse_scores?.mobile?.total_score ?? 0
                },
                desktop: {
                    performance: data.lighthouse_scores?.desktop?.performance ?? 0,
                    accessibility: data.lighthouse_scores?.desktop?.accessibility ?? 0,
                    best_practices: data.lighthouse_scores?.desktop?.best_practices ?? 0,
                    seo: data.lighthouse_scores?.desktop?.seo ?? 0,
                    total_score: data.lighthouse_scores?.desktop?.total_score ?? 0
                },
                performance: data.lighthouse_scores?.mobile?.performance ?? "—",
                accessibility: data.lighthouse_scores?.mobile?.accessibility ?? "—",
                bestPractices: data.lighthouse_scores?.mobile?.best_practices ?? "—",
                seo: data.lighthouse_scores?.mobile?.seo ?? "—"
            },
            seoMetrics: data.seo_analysis?.metrics ?? null,
            contactInfo: {
                email: "lewux.co@gmail.com",
                phone: "",
                website: "lewux.com"
            },
            errors,
            chartData,
            chartDataMobile,
            chartDataDesktop,
            webVitals,
            accessibility,
            bestPractices,
            nextSteps: data.final_conclusion?.next_steps ?? '',
            performanceRecommendations,
            seoRecommendationsArr,
            accessibilityRecommendations,
            finalRecommendations,
            accessibilityScoreBarHtml,
            accessibilityTextsHtml,
            bestPracticesScoreBarHtml,
            bestPracticesTextsHtml
        };
    }
}

module.exports = PDFGenerator;
