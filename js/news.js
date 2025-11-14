/**
 * News Section Manager
 * Loads and displays news items with toggle functionality
 */

(function() {
    'use strict';

    // ====== CONFIGURATION ======
    const NEWS_DISPLAY_LIMIT = 5; // Show first N news items by default (rest are hidden behind toggle)
    const NEWS_CUTOFF_DATE = null; // Filter news: null = show all, or set to 'YYYY-MM-DD' or 'YYYY-MM' to show only news since that date
    // Examples:
    // - null                 -> show all news
    // - '2024-01'            -> show only news from Jan 2024 onwards
    // - '2024-06-15'         -> show only news from Jun 15, 2024 onwards
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
        const d1 = date1.replace(/-/g, '');
        const d2 = date2.replace(/-/g, '');
        return d1 > d2 ? 1 : (d1 < d2 ? -1 : 0);
    }

    /**
     * Format date string
     * @param {string} dateStr - Date string in YYYY, YYYY-MM, or YYYY-MM-DD format
     * @returns {string} Formatted date
     */
    function formatDate(dateStr) {
        const parts = dateStr.split('-');
        const year = parts[0];
        const month = parts[1];
        const day = parts[2];

        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                          'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        if (day) {
            // YYYY-MM-DD format
            return `${monthNames[parseInt(month) - 1]} ${parseInt(day)}, ${year}`;
        } else if (month) {
            // YYYY-MM format
            return `${monthNames[parseInt(month) - 1]} ${year}`;
        }
        // YYYY format
        return year;
    }

    /**
     * Generate HTML for a single news item
     * @param {Object} item - News item object
     * @returns {string} HTML string
     */
    function generateNewsItemHTML(item) {
        return `
            <div class="news-item">
                <span class="news-date">${formatDate(item.date)}</span>
                <span class="news-content">${item.content}</span>
            </div>
        `;
    }

    /**
     * Load and display news
     */
    async function loadNews() {
        try {
            const response = await fetch('data/news.json');
            if (!response.ok) {
                throw new Error(`Failed to load data/news.json: ${response.status}`);
            }

            let newsItems = await response.json();
            console.log(`Loaded ${newsItems.length} news item(s)`);

            const container = document.getElementById('news-container');
            if (!container) {
                console.error('News container not found');
                return;
            }

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
            const container = document.getElementById('news-container');
            if (container) {
                container.innerHTML = '<p class="news-error">Failed to load news.</p>';
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
