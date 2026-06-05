/**
 * Gallery detail page
 * Renders ALL photos from data/gallery.yaml in a tiled grid, with a lightbox
 * (keyboard / button navigation) for viewing full-size images.
 */

(function () {
    'use strict';

    let items = [];
    let currentIndex = 0;
    let lightbox, lightboxImg, lightboxCaption;

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
            showIndex(currentIndex - 1);
        });
        lightbox.querySelector('.lightbox-next').addEventListener('click', (e) => {
            e.stopPropagation();
            showIndex(currentIndex + 1);
        });
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) closeLightbox();
        });
        document.addEventListener('keydown', (e) => {
            if (!lightbox.classList.contains('open')) return;
            if (e.key === 'Escape') closeLightbox();
            else if (e.key === 'ArrowLeft') showIndex(currentIndex - 1);
            else if (e.key === 'ArrowRight') showIndex(currentIndex + 1);
        });
    }

    function showIndex(index) {
        if (!items.length) return;
        currentIndex = (index + items.length) % items.length;
        const item = items[currentIndex];
        lightboxImg.src = item.src;
        lightboxImg.alt = item.alt || item.caption || '';
        lightboxCaption.textContent = item.caption || '';
        lightboxCaption.style.display = item.caption ? '' : 'none';
        const single = items.length <= 1;
        lightbox.querySelector('.lightbox-prev').style.display = single ? 'none' : '';
        lightbox.querySelector('.lightbox-next').style.display = single ? 'none' : '';
    }

    function openLightbox(index) {
        showIndex(index);
        lightbox.classList.add('open');
        lightbox.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        lightbox.classList.remove('open');
        lightbox.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    /* ------------------------------- Grid -------------------------------- */

    function renderGrid(container) {
        const grid = document.createElement('div');
        grid.className = 'gallery-grid';

        items.forEach((item, index) => {
            const figure = document.createElement('figure');
            figure.className = 'gallery-item';
            figure.tabIndex = 0;
            figure.setAttribute('role', 'button');
            figure.setAttribute('aria-label', item.caption || 'Open photo');

            const img = document.createElement('img');
            img.src = item.src;
            img.alt = item.alt || item.caption || '';
            img.loading = 'lazy';
            img.addEventListener('load', () => img.classList.add('loaded'), { once: true });
            img.addEventListener('error', () => figure.remove(), { once: true });
            figure.appendChild(img);

            if (item.caption) {
                const cap = document.createElement('figcaption');
                cap.className = 'gallery-item-caption';
                cap.textContent = item.caption;
                figure.appendChild(cap);
            }

            figure.addEventListener('click', () => openLightbox(index));
            figure.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openLightbox(index);
                }
            });

            grid.appendChild(figure);
        });

        container.innerHTML = '';
        container.appendChild(grid);
    }

    /* ------------------------------- Loader ------------------------------- */

    async function loadGallery() {
        const container = document.getElementById('gallery-grid-container');
        if (!container) return;

        try {
            await waitForJsYaml();
            const response = await fetch('data/gallery.yaml?v=' + new Date().getTime());
            if (!response.ok) throw new Error(`Failed to load data/gallery.yaml: ${response.status}`);

            const parsed = jsyaml.load(await response.text());
            items = Array.isArray(parsed) ? parsed.filter(it => it && it.src) : [];

            if (!items.length) {
                container.innerHTML = '<p class="news-empty">No photos yet.</p>';
                return;
            }

            buildLightbox();
            renderGrid(container);
            console.log(`Loaded ${items.length} gallery photo(s)`);
        } catch (error) {
            console.error('Error loading gallery:', error);
            container.innerHTML = '<p class="news-error">Failed to load gallery.</p>';
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadGallery);
    } else {
        loadGallery();
    }
})();
