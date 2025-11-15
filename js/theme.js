/**
 * Custom Theme Switcher (Dark -> Auto -> Light Cycle)
 * Defaults to 'light' on every page load.
 */
document.addEventListener('DOMContentLoaded', () => {
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    if (!themeToggleBtn) return;

    const body = document.body;

    const THEME_CYCLE = ['dark', 'auto', 'light'];
    let currentTheme = 'light'; // In-session state

    const DAY_START_HOUR = 6;
    const DAY_END_HOUR = 18;

    /**
     * Applies the selected theme.
     * @param {string} theme - 'light', 'dark', or 'auto'
     */
    function applyTheme(theme) {
        currentTheme = theme;
        let actualTheme = theme;

        if (theme === 'auto') {
            const currentHour = new Date().getHours();
            actualTheme = (currentHour >= DAY_START_HOUR && currentHour < DAY_END_HOUR) ? 'light' : 'dark';
            themeToggleBtn.classList.add('auto-mode');
        } else {
            themeToggleBtn.classList.remove('auto-mode');
        }

        if (actualTheme === 'dark') {
            body.classList.add('darkmode--activated');
        } else {
            body.classList.remove('darkmode--activated');
        }
    }

    /**
     * Gets the next theme in the cycle.
     * @returns {string} The next theme name.
     */
    function getNextTheme() {
        const currentIndex = THEME_CYCLE.indexOf(currentTheme);
        const nextIndex = (currentIndex + 1) % THEME_CYCLE.length;
        return THEME_CYCLE[nextIndex];
    }

    // Event Listener for the toggle button
    themeToggleBtn.addEventListener('click', () => {
        const nextTheme = getNextTheme();
        applyTheme(nextTheme);
    });

    // Apply 'light' theme on initial load
    applyTheme('light');
});