/**
 * BibTeX Parser and Publication Generator
 * Automatically loads publications.bib and generates HTML
 */

class BibTeXParser {
    /**
     * Parse BibTeX content and return array of publication objects
     * @param {string} content - BibTeX file content
     * @returns {Array} Array of publication objects
     */
    static parse(content) {
        const publications = [];

        // Split by @ to get individual entries
        const entries = content.split(/@\w+\{/).slice(1);

        entries.forEach(entry => {
            const pub = this.parseEntry(entry);
            if (pub) {
                publications.push(pub);
            }
        });

        return publications;
    }

    /**
     * Parse a single BibTeX entry
     * @param {string} entry - Single BibTeX entry
     * @returns {Object|null} Publication object or null
     */
    static parseEntry(entry) {
        const fields = {
            title: /title\s*=\s*\{([^}]+)\}/i,
            author: /author\s*=\s*\{([^}]+)\}/i,
            year: /year\s*=\s*\{([^}]+)\}/i,
            arxiv: /arxiv\s*=\s*\{([^}]+)\}/i,
            webpage: /webpage\s*=\s*\{([^}]+)\}/i,
            code: /code\s*=\s*\{([^}]+)\}/i,
            venues: /venues\s*=\s*\{([^}]+)\}/i,
            selected: /selected\s*=\s*\{([^}]+)\}/i,
            media: /media\s*=\s*\{([^}]+)\}/i
        };

        const parsed = {};

        for (const [field, pattern] of Object.entries(fields)) {
            const match = entry.match(pattern);
            if (match) {
                parsed[field] = match[1].trim();
            }
        }

        // Check required fields
        if (!parsed.title || !parsed.author || !parsed.year) {
            return null;
        }

        // Parse venues field: format is "venue1 [award1] | venue2 [award2] | ..."
        let venues = [];
        if (parsed.venues) {
            venues = parsed.venues.split('|').map(v => {
                const trimmed = v.trim();
                const awardMatch = trimmed.match(/^(.+?)\s*\[(.+?)\]$/);
                if (awardMatch) {
                    return { name: awardMatch[1].trim(), award: awardMatch[2].trim() };
                }
                return { name: trimmed, award: null };
            });
        }

        return {
            title: parsed.title,
            authors: parsed.author,
            year: parsed.year,
            venues: venues,
            arxiv: parsed.arxiv,
            webpage: parsed.webpage,
            code: parsed.code,
            selected: parsed.selected?.toLowerCase() === 'true',
            media: parsed.media
        };
    }
}

class AuthorFormatter {
    /**
     * Format author list and highlight specific author
     * @param {string} authorString - Author string from BibTeX
     * @param {string} highlightName - Name to highlight
     * @param {number} maxAuthors - Maximum authors before "et al."
     * @returns {string} Formatted HTML string
     */
    static format(authorString, highlightName = 'Jiarui Yao', maxAuthors = 12) {
        // Split by 'and'
        const authors = authorString.split(/\s+and\s+/).map(a => a.trim());

        const formatted = authors.map(author => {
            // Handle "Last, First" or "First Last" format
            let name;
            if (author.includes(',')) {
                const parts = author.split(',', 2);
                name = `${parts[1].trim()} ${parts[0].trim()}`;
            } else {
                name = author;
            }

            // Highlight the specified author
            if (name.toLowerCase().includes(highlightName.toLowerCase())) {
                return `<strong>${name}</strong>`;
            }
            return name;
        });

        // Join authors
        if (formatted.length > maxAuthors) {
            return formatted.slice(0, maxAuthors).join(', ') + ', et al.';
        }
        return formatted.join(', ');
    }
}

class PublicationHTMLGenerator {
    /**
     * Generate HTML for a single publication
     * @param {Object} pub - Publication object
     * @returns {string} HTML string
     */
    static generateHTML(pub) {
        const authorsHTML = AuthorFormatter.format(pub.authors);

        // Build venues HTML
        let venuesHTML = '';
        if (pub.venues && pub.venues.length > 0) {
            venuesHTML = pub.venues.map(venue => {
                const awardBadge = venue.award ?
                    `<span class="venue-award">${venue.award}</span>` : '';
                return `<div class="pub-venue-item">
                    <span class="venue-name">${venue.name}, ${pub.year}</span>
                    ${awardBadge}
                </div>`;
            }).join('');
        } else {
            venuesHTML = `<div class="pub-venue-item"><span class="venue-name">${pub.year}</span></div>`;
        }

        // Build links
        const links = [];
        if (pub.arxiv) {
            links.push(`<a href="${pub.arxiv}" target="_blank">arXiv</a>`);
        }
        if (pub.webpage) {
            links.push(`<a href="${pub.webpage}" target="_blank">Webpage</a>`);
        }
        if (pub.code) {
            links.push(`<a href="${pub.code}" target="_blank">Code</a>`);
        }

        const linksHTML = links.length > 0 ?
            `<div class="pub-links">${links.join(' / ')}</div>` : '';

        // Build media HTML
        let mediaHTML = '';
        if (pub.media) {
            const extension = pub.media.split('.').pop().toLowerCase();
            if (['gif', 'png', 'jpg', 'jpeg', 'webp'].includes(extension)) {
                mediaHTML = `<div class="pub-media"><img src="${pub.media}" alt="${pub.title} media"></div>`;
            } else if (['mp4', 'webm'].includes(extension)) {
                mediaHTML = `<div class="pub-media"><video autoplay loop muted playsinline src="${pub.media}"></video></div>`;
            }
        }

        const hasMediaClass = pub.media ? 'has-media' : '';

        return `
            <div class="publication ${hasMediaClass}">
                ${mediaHTML}
                <div class="pub-details">
                    <div class="pub-title">${pub.title}</div>
                    <div class="pub-authors">${authorsHTML}</div>
                    <div class="pub-venues">
                        ${venuesHTML}
                    </div>
                    ${linksHTML}
                </div>
            </div>
        `;
    }

    /**
     * Generate HTML for all selected publications
     * @param {Array} publications - Array of publication objects
     * @returns {string} HTML string
     */
    static generateAll(publications) {
        // Filter selected publications
        const selected = publications.filter(pub => pub.selected);

        // Generate HTML for each
        return selected.map(pub => this.generateHTML(pub)).join('\n');
    }
}

/**
 * Load publications from BibTeX file and render to DOM
 */
async function loadPublications() {
    try {
        // Fetch the BibTeX file
        const response = await fetch('data/publications.bib');
        if (!response.ok) {
            throw new Error(`Failed to load data/publications.bib: ${response.status}`);
        }

        const bibContent = await response.text();

        // Parse BibTeX
        const publications = BibTeXParser.parse(bibContent);
        console.log(`Loaded ${publications.length} publication(s)`);

        const selectedCount = publications.filter(p => p.selected).length;
        console.log(`Found ${selectedCount} selected publication(s)`);

        // Generate HTML
        const html = PublicationHTMLGenerator.generateAll(publications);

        // Insert into DOM
        const container = document.getElementById('publications-container');
        if (container) {
            container.innerHTML = html;
            console.log('Publications rendered successfully');
        } else {
            console.error('Publications container not found');
        }
    } catch (error) {
        console.error('Error loading publications:', error);
        const container = document.getElementById('publications-container');
        if (container) {
            container.innerHTML = '<p>Failed to load publications. Please refresh the page.</p>';
        }
    }
}

// Auto-load publications when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadPublications);
} else {
    loadPublications();
}
