/**
 * News Section Manager
 * Loads and displays news items from a YAML file, with Markdown support.
 */

(function() {
    'use strict';

    // Wait for required dependencies to load (KaTeX support is optional but preferred)
    function waitForDependencies() {
        return new Promise((resolve, reject) => {
            let attempts = 0;
            const maxAttempts = 200; // 10 seconds max wait time (200 * 50ms)
            
            const checkDependencies = () => {
                attempts++;
                const hasJsYaml = typeof jsyaml !== 'undefined';
                const hasMarked = typeof marked !== 'undefined';
                const hasKatex = typeof katex !== 'undefined';
                // Only jsyaml and marked are required; KaTeX support is optional
                if (hasJsYaml && hasMarked) {
                    if (hasKatex) {
                        console.log('All dependencies loaded successfully (including KaTeX math support)');
                    } else {
                        console.log('Required dependencies loaded (KaTeX not available, math formulas will not render)');
                    }
                    resolve();
                } else if (attempts >= maxAttempts) {
                    console.error('Dependencies loading timeout:', {
                        jsyaml: hasJsYaml,
                        marked: hasMarked,
                        katex: hasKatex,
                        markedKatex: hasMarkedKatex
                    });
                    reject(new Error('Failed to load required dependencies: ' + 
                        (!hasJsYaml ? 'jsyaml ' : '') +
                        (!hasMarked ? 'marked' : '')));
                } else {
                    setTimeout(checkDependencies, 50);
                }
            };
            checkDependencies();
        });
    }

    // Render math formulas using KaTeX
    function renderMathFormulas(html) {
        if (typeof katex === 'undefined') {
            return html;
        }

        try {
            // First, replace block math with placeholders to avoid conflicts
            const blockMathPlaceholders = [];
            html = html.replace(/\$\$([\s\S]*?)\$\$/g, (match, formula) => {
                const placeholder = `__BLOCK_MATH_${blockMathPlaceholders.length}__`;
                blockMathPlaceholders.push(formula.trim());
                return placeholder;
            });

            // Render LaTeX block: \[...\]
            html = html.replace(/\\\[([\s\S]*?)\\\]/g, (match, formula) => {
                try {
                    return katex.renderToString(formula.trim(), { displayMode: true, throwOnError: false });
                } catch (e) {
                    console.error('KaTeX block render error:', e);
                    return match;
                }
            });

            // Render inline math: $...$ (now safe since block math is replaced)
            html = html.replace(/\$([^$\n]+?)\$/g, (match, formula) => {
                try {
                    return katex.renderToString(formula.trim(), { displayMode: false, throwOnError: false });
                } catch (e) {
                    console.error('KaTeX inline render error:', e);
                    return match;
                }
            });

            // Render LaTeX inline: \(...\)
            html = html.replace(/\\\(([\s\S]*?)\\\)/g, (match, formula) => {
                try {
                    return katex.renderToString(formula.trim(), { displayMode: false, throwOnError: false });
                } catch (e) {
                    console.error('KaTeX inline render error:', e);
                    return match;
                }
            });

            // Restore and render block math placeholders
            blockMathPlaceholders.forEach((formula, index) => {
                const placeholder = `__BLOCK_MATH_${index}__`;
                try {
                    const rendered = katex.renderToString(formula, { displayMode: true, throwOnError: false });
                    html = html.replace(placeholder, rendered);
                } catch (e) {
                    console.error('KaTeX block render error:', e);
                    html = html.replace(placeholder, `$$${formula}$$`);
                }
            });

            return html;
        } catch (error) {
            console.error('Error rendering math formulas:', error);
            return html;
        }
    }

    // Initialize marked with math formula support
    function initializeMarked() {
        if (typeof marked !== 'undefined' && typeof katex !== 'undefined') {
            console.log('Marked and KaTeX are available - math formulas will be rendered');
        } else if (typeof marked !== 'undefined') {
            console.warn('Marked is available but KaTeX is not loaded. Math formulas will not render.');
        } else {
            console.warn('Marked is not available');
        }
    }

    // ====== CONFIGURATION ======
    const NEWS_DISPLAY_LIMIT = 5; // Show first N news items by default (rest are hidden behind toggle)
    const NEWS_CUTOFF_DATE = null; // Filter news: null = show all, or set to 'YYYY-MM-DD' or 'YYYY-MM' to show only news since that date
    // ===========================

    /**
     * Get cutoff date from configuration
     * @returns {string|null} Date string in YYYY-MM format, or null for no cutoff
     */
    function getCutoffDate() {
        return NEWS_CUTOFF_DATE;
    }

    /**
     * Compare dates (supports YYYY, YYYY-MM, YYYY-MM-DD)
     * @param {string} date1 - First date
     * @param {string} date2 - Second date
     * @returns {number} 1 if date1 > date2, -1 if date1 < date2, 0 if equal
     */
    function compareDates(date1, date2) {
        const d1 = String(date1).replace(/-/g, '');
        const d2 = String(date2).replace(/-/g, '');
        return d1 > d2 ? 1 : (d1 < d2 ? -1 : 0);
    }

    /**
     * Format date string
     * @param {string} dateStr - Date string in YYYY, YYYY-MM, or YYYY-MM-DD format
     * @returns {string} Formatted date
     */
    function formatDate(dateStr) {
        const parts = String(dateStr).split('-');
        const year = parts[0];
        const month = parts[1];
        const day = parts[2];

        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                          'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        if (day) {
            return `${monthNames[parseInt(month) - 1]} ${parseInt(day)}, ${year}`;
        } else if (month) {
            return `${monthNames[parseInt(month) - 1]} ${year}`;
        }
        return year;
    }

    /**
     * Generate HTML for a single news item
     * @param {Object} item - News item object
     * @returns {string} HTML string
     */
    function generateNewsItemHTML(item) {
        // Render content as Markdown
        let renderedContent = marked.parse(item.content.trim());
        // Render math formulas using KaTeX
        renderedContent = renderMathFormulas(renderedContent);
        return `
            <div class="news-item">
                <span class="news-date">${formatDate(item.date)}</span>
                <div class="news-content">${renderedContent}</div>
            </div>
        `;
    }

    /**
     * Load and display news
     */
    async function loadNews() {
        const container = document.getElementById('news-container');
        if (!container) {
            console.error('News container not found');
            return;
        }

        try {
            // Ensure dependencies are loaded
            await waitForDependencies();
            initializeMarked();

            // Fetch the YAML file
            const response = await fetch('data/news.yaml?v=' + new Date().getTime());
            if (!response.ok) {
                throw new Error(`Failed to load data/news.yaml: ${response.status}`);
            }

            const yamlText = await response.text();
            let newsItems = jsyaml.load(yamlText);
            console.log(`Loaded ${newsItems.length} news item(s) from YAML`);

            // Filter by cutoff date if specified
            const cutoffDate = getCutoffDate();
            if (cutoffDate) {
                newsItems = newsItems.filter(item => compareDates(item.date, cutoffDate) >= 0);
                console.log(`Filtered to ${newsItems.length} news item(s) since ${cutoffDate}`);
            }

            if (newsItems.length === 0) {
                container.innerHTML = '<p class="news-empty">No news yet.</p>';
                return;
            }

            // Split news into visible and hidden
            const visibleNews = newsItems.slice(0, NEWS_DISPLAY_LIMIT);
            const hiddenNews = newsItems.slice(NEWS_DISPLAY_LIMIT);

            // Generate HTML for visible news
            let html = '<div class="news-list">';
            html += visibleNews.map(item => generateNewsItemHTML(item)).join('');
            html += '</div>';

            // Add hidden news if any
            if (hiddenNews.length > 0) {
                html += '<div class="news-list news-hidden" id="hiddenNews" style="display: none;">';
                html += hiddenNews.map(item => generateNewsItemHTML(item)).join('');
                html += '</div>';

                html += `
                    <button class="news-toggle" id="newsToggle">
                        <span class="toggle-text">Show ${hiddenNews.length} older news</span>
                        <svg class="toggle-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </button>
                `;
            }

            container.innerHTML = html;

            // Add toggle functionality
            const toggleBtn = document.getElementById('newsToggle');
            const hiddenNewsDiv = document.getElementById('hiddenNews');

            if (toggleBtn && hiddenNewsDiv) {
                let isExpanded = false;

                toggleBtn.addEventListener('click', function() {
                    isExpanded = !isExpanded;

                    if (isExpanded) {
                        hiddenNewsDiv.style.display = 'block';
                        this.querySelector('.toggle-text').textContent = 'Show less';
                        this.querySelector('.toggle-icon').style.transform = 'rotate(180deg)';
                    } else {
                        hiddenNewsDiv.style.display = 'none';
                        this.querySelector('.toggle-text').textContent = `Show ${hiddenNews.length} older news`;
                        this.querySelector('.toggle-icon').style.transform = 'rotate(0deg)';
                    }
                });
            }

            console.log('News rendered successfully');
        } catch (error) {
            console.error('Error loading news:', error);
            if (container) {
                container.innerHTML = '<p class="news-error">Failed to load news. Please check the browser console for details.</p>';
            }
        }
    }

    // Auto-load news when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadNews);
    } else {
        loadNews();
    }
})();