# Delta Capital — Brand Asset Library

Delta Capital is a quantitative investment management website with comprehensive brand identity system and production-ready asset library.

## Asset Library

### Favicons & App Icons

Multi-platform favicon suite for optimal display across all browsers and devices:

- **favicon.svg** — Scalable vector icon
- **favicon.ico** — Multi-resolution ICO format (16×16, 32×32, 48×48)
- **apple-touch-icon.png** — iOS home screen icon (180×180)
- **apple-touch-icon-152x152.png** — iPad home screen (152×152)
- **apple-touch-icon-120x120.png** — iPhone home screen (120×120)
- **android-chrome-192x192.png** — Android home screen (192×192)
- **android-chrome-512x512.png** — Android splash screen (512×512)
- **manifest.json** — Web app manifest with all icon references

All icons located in `/img` directory.

### Social Media & Meta Assets

- **og-default.png** (1200×630px) — OpenGraph image for social sharing (LinkedIn, Twitter, Facebook)
- **logo.png** (512×512px) — Logo for JSON-LD structured data and schema markup

### Brand Kit Documentation

- **brandkit.html** — Comprehensive brand identity guidelines including:
  - Color palette specifications
  - Typography system (Cormorant Garamond + JetBrains Mono)
  - Logo and symbol usage
  - Imagery and visual style
  - Tone of voice guidelines
  - Asset library reference
  - HTML meta tags template
  - Print guidelines

## Utility Pages

Delta Capital includes branded utility pages for common scenarios:

### Error Pages
- **404.html** — Custom page not found error with CTAs to home and contact

### Maintenance & Launch
- **maintenance.html** — Standalone maintenance mode page with animated Delta symbol
- **coming-soon.html** — Pre-launch placeholder with full OG meta tags

### Compliance & Accessibility
- **accessibility.html** — WCAG 2.1 AA compliance statement and accessibility features documentation
- **disclosures.html** — Legal disclosures, disclaimers, and cookie policy

## CSS & Styling

### Design Tokens
All pages use consistent CSS custom properties (variables) defined in `css/style.css`:

```css
--bg: #fafafa              /* Primary background */
--bg-dark: #f3f3f3         /* Secondary background */
--fg: #111                 /* Primary text */
--fg-muted: #555           /* Secondary text */
--fg-faint: #999           /* Tertiary text */
--border: #e0e0e0          /* Borders & dividers */
--serif: 'Cormorant Garamond', 'Georgia', serif
--mono: 'JetBrains Mono', 'Fira Code', monospace
--ease: cubic-bezier(0.25, 0.1, 0.25, 1)
--duration: 0.8s
```

### Print Stylesheet
Every page supports print-optimized styling:
- Navigation and interactive elements automatically hidden
- Colors convert to black text on white background
- External link URLs display after links
- Smart page break management
- Responsive image scaling

Use browser print function (Ctrl+P / Cmd+P) to print any page as PDF.

### Cookie Notice
Lightweight cookie consent banner with localStorage persistence:
- Displayed at bottom of page
- Accepts cookies and persists choice
- Full accessibility support
- Customizable via `js/cookie-notice.js`

## Configuration Files

### manifest.json
Web App Manifest for PWA support with:
- App name, description, icons
- Display modes and theme colors
- Icon purposes and sizes

### vercel.json
Production deployment configuration:
- 404 error page routing
- Static file cache headers
- Manifest.json content type

### sitemap.xml
Search engine sitemap with:
- All primary pages
- Accessibility statement
- Proper priorities and change frequencies

## HTML Head Template

Include these meta tags in all pages:

```html
<!-- Favicon Suite -->
<link rel="icon" type="image/svg+xml" href="/img/favicon.svg">
<link rel="icon" type="image/x-icon" href="/img/favicon.ico">
<link rel="apple-touch-icon" sizes="180x180" href="/img/apple-touch-icon.png">
<link rel="apple-touch-icon" sizes="152x152" href="/img/apple-touch-icon-152x152.png">
<link rel="apple-touch-icon" sizes="120x120" href="/img/apple-touch-icon-120x120.png">
<link rel="manifest" href="/img/manifest.json">
<meta name="theme-color" content="#111111">

<!-- OpenGraph for Social Sharing -->
<meta property="og:image" content="https://deltacapitaltrading.com/img/og-default.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">

<!-- Canonical URL -->
<link rel="canonical" href="https://deltacapitaltrading.com/page-name.html">
```

## JavaScript

### Cookie Notice (`js/cookie-notice.js`)
Lightweight consent banner that:
- Checks localStorage for previous consent
- Displays banner if not previously accepted
- Stores acceptance in localStorage
- Provides `window.resetCookieConsent()` for testing

Include in all pages before `</body>`:
```html
<script src="/js/cookie-notice.js"></script>
```

### Core Scripts
- `js/core.js` — Common utilities and navigation
- `js/market.js` — Market data visualization
- `js/visualizations.js` — Chart and graph components
- `js/architecture.js` — Architecture diagram rendering

## Color Palette

**Monochromatic Core:**
- `#111111` — Primary black (text, headlines, core elements)
- `#555555` — Dark gray (body text, secondary content)
- `#999999` — Light gray (tertiary text, captions)
- `#e0e0e0` — Border gray (lines, dividers)
- `#f3f3f3` — Light background (containers, blocks)
- `#fafafa` — Primary white (main background)

## Typography

**Serif: Cormorant Garamond**
- Headlines (H1-H4)
- Body text and primary communication
- Email signatures
- Weights: 300 (light), 400 (regular), 500 (medium)

**Monospace: JetBrains Mono**
- Technical content and labels
- Data display
- Code blocks
- Emphasis and callouts

## File Structure

```
Website/
├── img/
│   ├── favicon.svg
│   ├── favicon.ico
│   ├── favicon-simple.svg
│   ├── apple-touch-icon*.png
│   ├── android-chrome-*.png
│   ├── og-default.png
│   ├── logo.png
│   ├── manifest.json
│   └── [team photos].png
├── css/
│   └── style.css (includes print & cookie styling)
├── js/
│   ├── core.js
│   ├── market.js
│   ├── visualizations.js
│   ├── architecture.js
│   ├── market-data.js
│   └── cookie-notice.js
├── blog/
│   └── [20 blog posts].html
├── 404.html
├── maintenance.html
├── coming-soon.html
├── accessibility.html
├── brandkit.html
├── disclosures.html
├── [30+ content pages].html
├── manifest.json
├── vercel.json
├── sitemap.xml
└── README.md (this file)
```

## Deployment

Deploy to Vercel with:
1. Connect GitHub repository
2. vercel.json handles error routing and caching
3. All assets in `/img` cached with 1-year immutable headers
4. XML/TXT files cached with 1-hour max-age

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Android)

## Accessibility

Delta Capital maintains WCAG 2.1 Level AA compliance:
- Semantic HTML structure
- Sufficient color contrast (4.5:1 minimum)
- Full keyboard navigation support
- Screen reader compatible
- Responsive design (320px–1920px+)

See `accessibility.html` for detailed compliance statement.

## Getting Started

1. **Clone the repository**
2. **View brand kit**: Open `brandkit.html` in browser for complete style guide
3. **Print brand kit**: Use Ctrl+P or Cmd+P, check "Print Background Graphics"
4. **Email signatures**: Reference `email-signatures.html` for templates
5. **Social sharing**: All pages include OpenGraph meta tags
6. **Print any page**: Built-in print stylesheet handles formatting

## Legal

All content, design, and code are the property of Delta Capital. See `disclosures.html` for full legal disclosures and intellectual property information.

---

**Version:** 1.0
**Last Updated:** February 2026
