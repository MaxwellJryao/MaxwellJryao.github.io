# A Minimalist Personal Homepage

A modern, single-page academic homepage featuring a clean, minimalist design with enhanced visual effects and interactive features.

## Features

### Core Functionality
- **Single-page design** - All content on one page with smooth scrolling navigation
- **Dynamic content loading** - Publications loaded from BibTeX, news from YAML
- **Responsive design** - Optimized for desktop, tablet, and mobile devices
- **Dark/Light theme** - Automatic theme switching with manual override option
- **Table of Contents** - Fixed sidebar navigation for easy section access

### Visual Enhancements
- **Scroll progress bar** - Visual indicator at the top showing reading progress
- **Smooth animations** - Fade-in effects for sections as you scroll
- **Interactive cards** - Hover effects on sections, publications, and news items
- **Animated links** - Underline animations on text links
- **Image lazy loading** - Optimized image loading with blur-to-clear transitions
- **Profile photo animation** - Elegant scale and fade-in effect

### Special Features
- **Random Chinese Poetry** - Displays random classical Chinese poetry from API (located at the bottom)
- **Publication management** - Easy BibTeX-based publication system
- **News feed** - YAML-based news updates with Markdown support
- **Academic services** - Clean display of conference/journal reviewing activities

## Project Structure

```
githubid.github.io/
├── index.html              # Main HTML file
├── css/
│   └── styles.css          # All styles (responsive, dark mode, animations)
├── js/
│   ├── animations.js       # Scroll-based fade-in animations
│   ├── enhancements.js     # Scroll progress, image lazy loading
│   ├── news.js             # News loader from YAML
│   ├── publications.js     # BibTeX parser and publication renderer
│   ├── poetry.js           # Chinese poetry API integration
│   ├── theme.js            # Dark/Light theme switcher
│   └── toc.js              # Table of contents navigation
├── data/
│   ├── news.yaml           # News entries in YAML format
│   └── publications.bib    # Publications in BibTeX format
├── assets/
│   ├── favicon1.png        # Site favicon
│   ├── pic_jiarui-480.png  # Profile photo
│   └── pub_media/          # Publication media (images/videos)
└── README.md               # This file
```

## Customization

### Personal Information
Edit `index.html` to update:
- Name, title, affiliation
- Email address
- Social media links
- Profile photo path
- About section content
- Education details
- Academic services

### Publications
1. Edit `data/publications.bib` in BibTeX format
2. Add `selected = {true}` to publications you want to display
3. Add `media = {path/to/image.png}` for publication thumbnails
4. Supported fields: `title`, `author`, `year`, `venues`, `arxiv`, `webpage`, `code`, `media`, `selected`

Example BibTeX entry:
```bibtex
@article{example2024,
    title = {Example Paper Title},
    author = {Author One and Author Two and Author Three},
    year = {2024},
    venues = {Conference Name, 2024 | Journal Name, 2024 [Best Paper]},
    arxiv = {https://arxiv.org/abs/xxxx.xxxxx},
    webpage = {https://example.com},
    code = {https://github.com/example},
    media = {assets/pub_media/example.png},
    selected = {true}
}
```

### News
Edit `data/news.yaml` to add news entries:
```yaml
- date: "2024-01-15"
  content: "News content with **Markdown** support and [links](https://example.com)"
```

### Styling
- **Colors**: Edit CSS variables in `css/styles.css` (lines 1-47)
- **Fonts**: Change font-family in `css/styles.css` (currently using Inter)
- **Layout**: Adjust container max-width, padding, margins in `css/styles.css`

### Poetry Display
- Located at the bottom of the page (after Misc section)
- Uses [今日诗词 API](https://www.jinrishici.com/) for random Chinese poetry
- Can be disabled by removing the poetry container from `index.html` and `poetry.js` script tag

## Local Development

Simply open `index.html` in your browser, or use a simple HTTP server:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`

**Note**: For local development, you may need to serve files via HTTP server (not `file://`) due to CORS restrictions when loading YAML and BibTeX files.

## Deployment to GitHub Pages

### Method 1: Using GitHub Web Interface (Simplest)

1. **Create GitHub Repository**
   - Visit [GitHub](https://github.com) and log in
   - Click the "+" button in the top right, select "New repository"
   - Repository name must be: `githubid.github.io` (matching your GitHub username)
   - Set to Public (GitHub Pages free tier requires public repositories)
   - Don't initialize README, .gitignore, or license (local files already exist)

2. **Upload Files to GitHub**
   - In the project root directory, run:
   ```bash
   cd /path/to/githubid.github.io
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/githubid/githubid.github.io.git
   git push -u origin main
   ```

3. **Enable GitHub Pages**
   - In the GitHub repository page, click "Settings"
   - Find "Pages" in the left menu
   - Under "Source", select "Deploy from a branch"
   - Branch: `main`, Folder: `/ (root)`
   - Click "Save"

4. **Access Website**
   - Wait a few minutes, then visit: `https://githubid.github.io`
   - GitHub Pages usually takes a few minutes to build and deploy

### Method 2: Using Command Line (Recommended)

If you already have Git configured locally:

```bash
# Navigate to project directory
cd /path/to/githubid.github.io

# Initialize Git repository (if not already done)
git init

# Add all files
git add .

# Commit changes
git commit -m "Initial commit"

# Add remote repository (replace with your actual repository URL)
git remote add origin https://github.com/githubid/githubid.github.io.git

# Push to GitHub
git branch -M main
git push -u origin main
```

Then follow Method 1, Step 3 to enable GitHub Pages.

### Updating the Website

After making changes, update with:

```bash
git add .
git commit -m "Update website"
git push
```

GitHub Pages will automatically redeploy (usually takes a few minutes).

## Technical Details

### Dependencies
- **Font Awesome** - Icons (loaded via CDN)
- **Inter Font** - Google Fonts (loaded via CDN)
- **js-yaml** - YAML parser for news (loaded via CDN)
- **marked** - Markdown parser for news content (loaded via CDN)
- **KaTeX** - Math rendering (loaded via CDN, optional)
- **今日诗词 API** - Chinese poetry API (external)

### Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Responsive design works on mobile devices
- Dark mode supported in all modern browsers

### Performance
- Lazy loading for images
- Intersection Observer API for scroll animations
- RequestAnimationFrame for smooth scroll progress
- Minimal external dependencies

## Notes

- ✅ Repository name must be in `username.github.io` format
- ✅ `.nojekyll` file ensures GitHub Pages serves static files directly (no Jekyll processing)
- ✅ All static files (HTML, CSS, JS, images) are in root or subdirectories
- ⚠️ First deployment may take 5-10 minutes to take effect
- ⚠️ If using a custom domain, configure it in repository Settings > Pages
- ⚠️ Poetry API requires internet connection to fetch random poems

## License

See [LICENSE](LICENSE) file for details.
