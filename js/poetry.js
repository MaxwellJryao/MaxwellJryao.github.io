/**
 * Poetry Display
 * Fetches random Chinese poetry from API and displays it elegantly
 */

document.addEventListener('DOMContentLoaded', () => {
    const poetryText = document.getElementById('poetryText');
    const poetryAuthor = document.getElementById('poetryAuthor');
    const poetryRefresh = document.getElementById('poetryRefresh');
    const poetryContainer = document.getElementById('poetryContainer');

    if (!poetryText || !poetryAuthor || !poetryRefresh) return;

    // API endpoint - 今日诗词API (免费，无需API key)
    const POETRY_API = 'https://v1.jinrishici.com/all.json';

    /**
     * Fetch poetry from API
     */
    async function fetchPoetry() {
        try {
            poetryText.textContent = 'Loading...';
            poetryAuthor.textContent = '';
            poetryContainer.classList.add('loading');

            const response = await fetch(POETRY_API, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            // Format poetry content
            const content = data.content || '';
            const origin = data.origin || '';
            const author = data.author || '';
            const dynasty = data.dynasty || '';

            // Display poetry
            poetryText.textContent = content;
            
            // Display author info
            if (origin && author) {
                const authorText = `${author}${dynasty ? ` · ${dynasty}` : ''}《${origin}》`;
                poetryAuthor.textContent = authorText;
            } else if (author) {
                poetryAuthor.textContent = author;
            }

            poetryContainer.classList.remove('loading');
            poetryContainer.classList.add('loaded');

            // Fade in animation
            setTimeout(() => {
                poetryContainer.style.opacity = '1';
            }, 100);

        } catch (error) {
            console.error('Error fetching poetry:', error);
            poetryText.textContent = 'Unable to load poetry. Please try again later.';
            poetryAuthor.textContent = '';
            poetryContainer.classList.remove('loading');
            
            // Try fallback API
            tryFallbackAPI();
        }
    }

    /**
     * Fallback API - 古诗词API
     */
    async function tryFallbackAPI() {
        try {
            const fallbackAPI = 'https://api.gushi.ci/all.json';
            const response = await fetch(fallbackAPI);
            
            if (response.ok) {
                const data = await response.json();
                if (data.content) {
                    poetryText.textContent = data.content;
                    if (data.author) {
                        poetryAuthor.textContent = `${data.author}${data.dynasty ? ` · ${data.dynasty}` : ''}`;
                    }
                    poetryContainer.classList.add('loaded');
                }
            }
        } catch (error) {
            console.error('Fallback API also failed:', error);
        }
    }

    /**
     * Refresh poetry with animation
     */
    function refreshPoetry() {
        poetryContainer.style.opacity = '0.5';
        setTimeout(() => {
            fetchPoetry();
        }, 200);
    }

    // Event listeners
    poetryRefresh.addEventListener('click', refreshPoetry);

    // Initial load
    fetchPoetry();

    // Auto refresh every 30 minutes (optional)
    // setInterval(fetchPoetry, 30 * 60 * 1000);
});

