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
            journal: /journal\s*=\s*\{([^}]+)\}/i,
            year: /year\s*=\s*\{([^}]+)\}/i,
            arxiv: /arxiv\s*=\s*\{([^}]+)\}/i,
            paper: /paper\s*=\s*\{([^}]+)\}/i,
            webpage: /webpage\s*=\s*\{([^}]+)\}/i,
            code: /code\s*=\s*\{([^}]+)\}/i,
            selected: /selected\s*=\s*\{([^}]+)\}/i
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

        return {
            title: parsed.title,
            authors: parsed.author,
            venue: parsed.journal || '',
            year: parsed.year,
            arxiv: parsed.arxiv,
            paper: parsed.paper,
            webpage: parsed.webpage,
            code: parsed.code,
            selected: parsed.selected?.toLowerCase() === 'true'
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
    static format(authorString, highlightName = 'Jiarui Yao', maxAuthors = 10) {
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
        const venueStr = pub.venue ? `${pub.venue}, ${pub.year}` : pub.year;

        // Build links
        const links = [];
        if (pub.arxiv) {
            links.push(`<a href="${pub.arxiv}" target="_blank">arXiv</a>`);
        }
        if (pub.paper) {
            links.push(`<a href="${pub.paper}" target="_blank">Paper</a>`);
        }
        if (pub.webpage) {
            links.push(`<a href="${pub.webpage}" target="_blank">Webpage</a>`);
        }
        if (pub.code) {
            links.push(`<a href="${pub.code}" target="_blank">Code</a>`);
        }

        const linksHTML = links.length > 0 ?
            `<div class="pub-links">${links.join(' / ')}</div>` : '';

        return `
            <div class="publication">
                <div class="pub-title">${pub.title}</div>
                <div class="pub-authors">${authorsHTML}</div>
                <div class="pub-venue">${venueStr}</div>
                ${linksHTML}
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
        const response = await fetch('publications.bib');
        if (!response.ok) {
            throw new Error(`Failed to load publications.bib: ${response.status}`);
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
