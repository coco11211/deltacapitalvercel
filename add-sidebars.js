#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const VARIANTS = ['variant-a', 'variant-b', 'variant-c'];

function getRandomVariant() {
  return VARIANTS[Math.floor(Math.random() * VARIANTS.length)];
}

function createSidebar(variant) {
  return `<aside class="blog-sidebar ${variant}">
            <h3>Key Takeaways</h3>
            <div class="sidebar-item">
              <div class="sidebar-item-content">
                <ul>
                  <li>Disciplined approach to analysis</li>
                  <li>Risk management integration</li>
                  <li>Operational clarity</li>
                </ul>
              </div>
            </div>

            <h3>Further Reading</h3>
            <div class="sidebar-item">
              <div class="sidebar-item-content">
                <p><a href="/glossary.html">Financial terms glossary</a></p>
              </div>
            </div>
          </aside>`;
}

function processBlogFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Skip if sidebar already exists
  if (content.includes('class="blog-sidebar')) {
    console.log(`⊘ ${path.basename(filePath)} — already has sidebar`);
    return false;
  }

  const variant = getRandomVariant();
  const sidebar = createSidebar(variant);

  // Insert sidebar right after closing </article> tag
  content = content.replace(
    /(<\/article>)([\s\S]*?)(<\/div>\s*<\/div>\s*<\/section>)/,
    (match, articleClose, middle, sectionClose) => {
      return articleClose + middle + sidebar + sectionClose;
    }
  );

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✓ ${path.basename(filePath)} — added ${variant}`);
  return true;
}

// Get all blog HTML files
const blogDir = path.join(__dirname, 'blog');
const blogFiles = fs.readdirSync(blogDir).filter(f => f.endsWith('.html'));

console.log(`\n🔨 Adding sidebars to ${blogFiles.length} blog posts...\n`);

let updated = 0;
blogFiles.forEach(file => {
  if (processBlogFile(path.join(blogDir, file))) {
    updated++;
  }
});

console.log(`\n✨ Complete! Updated ${updated} blog posts.\n`);
