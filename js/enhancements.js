/**
 * Enhanced Visual Effects
 * - Scroll progress bar
 * - Image lazy loading with fade-in
 * - Smooth scroll behavior enhancements
 */

document.addEventListener('DOMContentLoaded', () => {
    // Scroll Progress Bar
    initScrollProgress();
    
    // Image Lazy Loading
    initImageLazyLoad();
    
    // Smooth scroll enhancement
    enhanceSmoothScroll();
});

/**
 * Initialize scroll progress bar
 */
function initScrollProgress() {
    const scrollProgress = document.getElementById('scrollProgress');
    if (!scrollProgress) return;

    let ticking = false;

    function updateScrollProgress() {
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollableHeight = documentHeight - windowHeight;
        const scrollPercentage = (scrollTop / scrollableHeight) * 100;

        scrollProgress.style.width = Math.min(scrollPercentage, 100) + '%';
        ticking = false;
    }

    function requestTick() {
        if (!ticking) {
            window.requestAnimationFrame(updateScrollProgress);
            ticking = true;
        }
    }

    window.addEventListener('scroll', requestTick, { passive: true });
    updateScrollProgress(); // Initial update
}

/**
 * Initialize image lazy loading with fade-in effect
 */
function initImageLazyLoad() {
    const images = document.querySelectorAll('img');
    
    // Use Intersection Observer for better performance
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    
                    // If image is already loaded, add class immediately
                    if (img.complete) {
                        img.classList.add('loaded');
                    } else {
                        // Wait for image to load
                        img.addEventListener('load', () => {
                            img.classList.add('loaded');
                        }, { once: true });
                    }
                    
                    observer.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px' // Start loading 50px before image enters viewport
        });

        images.forEach(img => {
            // Set loading attribute for native lazy loading
            if (!img.hasAttribute('loading')) {
                img.setAttribute('loading', 'lazy');
            }
            imageObserver.observe(img);
        });
    } else {
        // Fallback for browsers without IntersectionObserver
        images.forEach(img => {
            if (img.complete) {
                img.classList.add('loaded');
            } else {
                img.addEventListener('load', () => {
                    img.classList.add('loaded');
                }, { once: true });
            }
        });
    }
}

/**
 * Enhance smooth scroll behavior
 */
function enhanceSmoothScroll() {
    // Add smooth scroll to anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#' || href === '#!') return;
            
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                const offsetTop = target.offsetTop - 20; // Small offset for better visibility
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

