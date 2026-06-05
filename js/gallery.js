/**
 * Photo Gallery — Center / Peek Carousel with infinite loop
 * Loads photos from data/gallery.yaml, renders a carousel where the active
 * photo is centered and the previous / next photos peek (faded) on the
 * left / right. Wraps around seamlessly via cloned end slides. Clicking the
 * centered photo opens a lightbox with keyboard / button navigation.
 */

(function () {
    'use strict';

    const AUTOPLAY_MS = 4000; // Time between automatic slides

    let items = [];
    let realLen = 0;

    // Carousel state
    let carousel, viewport, track, dotsWrap;
    let slides = [];      // Extended slide elements (incl. clones when looping)
    let position = 0;     // Index into `slides`
    let looping = false;  // Whether end clones are present
    let jumping = false;  // Guard during a wrap-around silent jump
    let autoplayTimer = null;

    // Lightbox state
    let lightbox, lightboxImg, lightboxCaption;
    let lightboxIndex = 0; // Real index currently shown in the lightbox
    let hiresToken = 0;    // Guards against out-of-order high-res loads

    function waitForJsYaml() {
        return new Promise((resolve, reject) => {
            let attempts = 0;
            const maxAttempts = 200; // ~10s
            const check = () => {
                if (typeof jsyaml !== 'undefined') {
                    resolve();
                } else if (++attempts >= maxAttempts) {
                    reject(new Error('js-yaml failed to load'));
                } else {
                    setTimeout(check, 50);
                }
            };
            check();
        });
    }

    /* ------------------------------ Carousel ------------------------------ */

    function makeSlide(item, realIndex) {
        const slide = document.createElement('div');
        slide.className = 'carousel-slide';
        slide.dataset.real = String(realIndex);

        const img = document.createElement('img');
        img.src = item.thumb || item.src; // Low-res thumbnail for fast loading
        img.alt = item.alt || item.caption || '';
        img.loading = 'lazy';
        img.addEventListener('load', () => img.classList.add('loaded'), { once: true });
        slide.appendChild(img);

        if (item.caption) {
            const cap = document.createElement('div');
            cap.className = 'carousel-caption';
            cap.textContent = item.caption;
            slide.appendChild(cap);
        }

        slide.addEventListener('click', () => {
            if (slide === slides[position]) {
                openLightbox(realIndex);
            } else if (slide === slides[position - 1]) {
                go(-1);
                restartAutoplay();
            } else if (slide === slides[position + 1]) {
                go(1);
                restartAutoplay();
            }
        });

        return slide;
    }

    function renderCarousel(container) {
        realLen = items.length;
        looping = realLen > 1;

        carousel = document.createElement('div');
        carousel.className = 'carousel';
        if (!looping) carousel.classList.add('carousel-single');

        viewport = document.createElement('div');
        viewport.className = 'carousel-viewport';

        track = document.createElement('div');
        track.className = 'carousel-track';

        slides = [];
        // When looping, clone the last photo before the first and the first
        // photo after the last so both peeks are always populated.
        if (looping) slides.push(makeSlide(items[realLen - 1], realLen - 1));
        items.forEach((item, i) => slides.push(makeSlide(item, i)));
        if (looping) slides.push(makeSlide(items[0], 0));

        slides.forEach(s => track.appendChild(s));
        viewport.appendChild(track);
        carousel.appendChild(viewport);

        position = looping ? 1 : 0; // First real photo

        if (looping) {
            const prev = document.createElement('button');
            prev.className = 'carousel-arrow carousel-arrow-prev';
            prev.setAttribute('aria-label', 'Previous photo');
            prev.innerHTML = '&#8249;';
            prev.addEventListener('click', () => { go(-1); restartAutoplay(); });

            const next = document.createElement('button');
            next.className = 'carousel-arrow carousel-arrow-next';
            next.setAttribute('aria-label', 'Next photo');
            next.innerHTML = '&#8250;';
            next.addEventListener('click', () => { go(1); restartAutoplay(); });

            carousel.appendChild(prev);
            carousel.appendChild(next);

            dotsWrap = document.createElement('div');
            dotsWrap.className = 'carousel-dots';
            items.forEach((_, i) => {
                const dot = document.createElement('button');
                dot.className = 'carousel-dot';
                dot.setAttribute('aria-label', `Go to photo ${i + 1}`);
                dot.addEventListener('click', () => { goToReal(i, true); restartAutoplay(); });
                dotsWrap.appendChild(dot);
            });

            // Seamless wrap: after sliding onto a clone, jump silently to the
            // matching real slide once the transform transition completes.
            track.addEventListener('transitionend', (e) => {
                if (e.target !== track || e.propertyName !== 'transform') return;
                if (position === slides.length - 1) {
                    position = 1;
                    positionTrack(false);
                } else if (position === 0) {
                    position = slides.length - 2;
                    positionTrack(false);
                }
                jumping = false;
            });
        }

        container.innerHTML = '';
        container.appendChild(carousel);
        if (dotsWrap) container.appendChild(dotsWrap);

        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => positionTrack(false), 100);
        });

        // First paint without animation
        requestAnimationFrame(() => positionTrack(false));

        if (looping) {
            startAutoplay();
            carousel.addEventListener('mouseenter', stopAutoplay);
            carousel.addEventListener('mouseleave', startAutoplay);
            carousel.addEventListener('focusin', stopAutoplay);
            carousel.addEventListener('focusout', startAutoplay);
        }
    }

    function realIndexAt(pos) {
        return parseInt(slides[pos].dataset.real, 10) || 0;
    }

    // Center slides[position] in the viewport. Uses offsetLeft/offsetWidth so
    // the per-slide scale() transform does not corrupt the math.
    function positionTrack(animate = true) {
        if (!track || !slides.length || !viewport) return;
        const slide = slides[position];
        const offset = viewport.clientWidth / 2 - (slide.offsetLeft + slide.offsetWidth / 2);

        track.style.transition = animate ? '' : 'none';
        track.style.transform = `translateX(${offset}px)`;
        if (!animate) {
            void track.offsetWidth; // Force reflow, then restore transitions
            track.style.transition = '';
        }

        slides.forEach((s, i) => s.classList.toggle('active', i === position));
        updateDots();
    }

    function updateDots() {
        if (!dotsWrap) return;
        const real = realIndexAt(position);
        Array.from(dotsWrap.children).forEach((dot, i) => {
            dot.classList.toggle('active', i === real);
        });
    }

    function go(delta) {
        if (jumping || !looping) return;
        position += delta;
        // Entering a clone triggers a silent jump on transitionend
        if (position === 0 || position === slides.length - 1) jumping = true;
        positionTrack(true);
    }

    function goToReal(realIndex, animate) {
        position = looping ? realIndex + 1 : realIndex;
        positionTrack(animate);
    }

    function startAutoplay() {
        if (autoplayTimer || !looping) return;
        autoplayTimer = setInterval(() => go(1), AUTOPLAY_MS);
    }

    function stopAutoplay() {
        if (autoplayTimer) {
            clearInterval(autoplayTimer);
            autoplayTimer = null;
        }
    }

    function restartAutoplay() {
        stopAutoplay();
        startAutoplay();
    }

    /* ------------------------------ Lightbox ------------------------------ */

    function buildLightbox() {
        lightbox = document.createElement('div');
        lightbox.className = 'lightbox';
        lightbox.setAttribute('role', 'dialog');
        lightbox.setAttribute('aria-modal', 'true');
        lightbox.setAttribute('aria-hidden', 'true');
        lightbox.innerHTML = `
            <button class="lightbox-close" aria-label="Close">&times;</button>
            <button class="lightbox-nav lightbox-prev" aria-label="Previous">&#8249;</button>
            <figure class="lightbox-figure">
                <img class="lightbox-img" alt="">
                <figcaption class="lightbox-caption"></figcaption>
            </figure>
            <button class="lightbox-nav lightbox-next" aria-label="Next">&#8250;</button>
        `;
        document.body.appendChild(lightbox);

        lightboxImg = lightbox.querySelector('.lightbox-img');
        lightboxCaption = lightbox.querySelector('.lightbox-caption');

        lightbox.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
        lightbox.querySelector('.lightbox-prev').addEventListener('click', (e) => {
            e.stopPropagation();
            showLightbox(lightboxIndex - 1);
        });
        lightbox.querySelector('.lightbox-next').addEventListener('click', (e) => {
            e.stopPropagation();
            showLightbox(lightboxIndex + 1);
        });
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) closeLightbox();
        });
        document.addEventListener('keydown', (e) => {
            if (!lightbox.classList.contains('open')) return;
            if (e.key === 'Escape') closeLightbox();
            else if (e.key === 'ArrowLeft') showLightbox(lightboxIndex - 1);
            else if (e.key === 'ArrowRight') showLightbox(lightboxIndex + 1);
        });
    }

    function showLightbox(realIndex) {
        if (!realLen) return;
        lightboxIndex = (realIndex + realLen) % realLen;
        const item = items[lightboxIndex];
        lightboxImg.alt = item.alt || item.caption || '';
        lightboxCaption.textContent = item.caption || '';
        lightboxCaption.style.display = item.caption ? '' : 'none';

        // Progressive load: show the (cached) thumbnail instantly, then swap in
        // the full-resolution image once it has finished downloading.
        const thumb = item.thumb || item.src;
        const token = ++hiresToken;
        lightboxImg.src = thumb;
        if (item.src && item.src !== thumb) {
            lightbox.classList.add('lightbox-loading');
            const full = new Image();
            full.onload = () => {
                if (token === hiresToken) {
                    lightboxImg.src = item.src;
                    lightbox.classList.remove('lightbox-loading');
                }
            };
            full.onerror = () => { if (token === hiresToken) lightbox.classList.remove('lightbox-loading'); };
            full.src = item.src;
        } else {
            lightbox.classList.remove('lightbox-loading');
        }

        // Keep the carousel in sync (silently, behind the overlay)
        goToReal(lightboxIndex, false);
        const single = realLen <= 1;
        lightbox.querySelector('.lightbox-prev').style.display = single ? 'none' : '';
        lightbox.querySelector('.lightbox-next').style.display = single ? 'none' : '';
    }

    function openLightbox(realIndex) {
        stopAutoplay();
        showLightbox(realIndex);
        lightbox.classList.add('open');
        lightbox.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        lightbox.classList.remove('open');
        lightbox.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        startAutoplay();
    }

    /* ------------------------------- Loader ------------------------------- */

    async function loadGallery() {
        const section = document.getElementById('gallery');
        const container = document.getElementById('gallery-container');
        if (!container) return;

        try {
            await waitForJsYaml();
            const response = await fetch('data/gallery.yaml?v=' + new Date().getTime());
            if (!response.ok) throw new Error(`Failed to load data/gallery.yaml: ${response.status}`);

            const parsed = jsyaml.load(await response.text());
            items = Array.isArray(parsed) ? parsed.filter(it => it && it.src) : [];

            if (!items.length) {
                if (section) section.style.display = 'none';
                return;
            }

            buildLightbox();
            renderCarousel(container);
            console.log(`Loaded ${items.length} gallery photo(s)`);
        } catch (error) {
            console.error('Error loading gallery:', error);
            if (section) section.style.display = 'none';
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadGallery);
    } else {
        loadGallery();
    }
})();
