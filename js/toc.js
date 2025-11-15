/**
 * Table of Contents - Active Section Highlighting
 * Highlights the current section in the TOC based on scroll position
 */

(function() {
    'use strict';

    // Get all sections and TOC links
    const sections = document.querySelectorAll('.section[id]');
    const tocLinks = document.querySelectorAll('.toc-link');

    // Function to update active TOC link
    function updateActiveTocLink() {
        let currentSection = '';
        const scrollPosition = window.scrollY + 100; // Offset for better UX

        // Find which section is currently in view
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                currentSection = section.getAttribute('id');
            }
        });

        // Update active class on TOC links
        tocLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSection}`) {
                link.classList.add('active');
            }
        });
    }

    // Smooth scroll behavior for TOC links
    tocLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);

            if (targetSection) {
                const targetPosition = targetSection.offsetTop - 80; // Offset for better positioning
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Update on scroll
    let scrollTimeout;
    window.addEventListener('scroll', function() {
        // Debounce for better performance
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(updateActiveTocLink, 10);
    });

    // Update on page load
    window.addEventListener('load', updateActiveTocLink);

    // Update on DOMContentLoaded in case load event already fired
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        updateActiveTocLink();
    } else {
        document.addEventListener('DOMContentLoaded', updateActiveTocLink);
    }

    // Back to top button
    const backToTopBtn = document.getElementById('backToTop');

    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // TOC toggle for narrow screens
    const tocToggleBtn = document.getElementById('tocToggleBtn');
    const tocNav = document.getElementById('tocNav');

    if (tocToggleBtn && tocNav) {
        tocToggleBtn.addEventListener('click', function() {
            tocNav.classList.toggle('visible');
        });

        // Close TOC when clicking outside on narrow screens
        document.addEventListener('click', function(e) {
            if (window.innerWidth <= 1200) {
                if (!tocNav.contains(e.target) && !tocToggleBtn.contains(e.target)) {
                    tocNav.classList.remove('visible');
                }
            }
        });

        // Auto-hide TOC when window is resized above breakpoint
        window.addEventListener('resize', function() {
            if (window.innerWidth > 1200) {
                tocNav.classList.remove('visible');
            }
        });
    }
})();
