#!/usr/bin/env python3
"""
Remove .html suffixes from all internal links in HTML files.
This creates clean URLs (e.g., /page.html → /page) that work with Vercel clean URLs.
"""

import os
import re
from pathlib import Path

def remove_html_suffixes_from_content(content):
    """Remove .html suffix from URLs in HTML content."""
    # Canonical URLs in meta tags
    content = re.sub(r'(href|src)="https?://deltacapitaltrading\.com/([^\s"]+)\.html"', r'\1="https://deltacapitaltrading.com/\2"', content)

    # Canonical URLs with trailing slash
    content = re.sub(r'(href|src)="https?://deltacapitaltrading\.com/([^\s"]+)/\.html"', r'\1="https://deltacapitaltrading.com/\2/"', content)

    # Absolute paths (non-https URLs)
    content = re.sub(r'(href|src)="/([^\s"]+)\.html"', r'\1="/\2"', content)

    # Absolute paths with trailing slash
    content = re.sub(r'(href|src)="/([^\s"]+)/\.html"', r'\1="/\2/"', content)

    # Internal relative links
    content = re.sub(r'(href|src)="([^\s"]+)\.html"', r'\1="\2"', content)

    # Internal relative links with trailing slash
    content = re.sub(r'(href|src)="([^\s"]+)/\.html"', r'\1="\2/"', content)

    return content

def process_html_file(filepath):
    """Process a single HTML file."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        original_content = content

        # Remove .html suffixes from all URLs
        content = remove_html_suffixes_from_content(content)

        # Only write if content changed
        if content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            return True

        return False
    except Exception as e:
        print(f"Error processing {filepath}: {e}")
        return False

def main():
    """Process all HTML files in the Website directory and its subdirectories."""
    website_dir = Path.cwd() / "Website"

    if not website_dir.exists():
        print(f"Error: Website directory not found at {website_dir}")
        return

    html_files = list(website_dir.rglob("*.html"))
    print(f"Found {len(html_files)} HTML files")

    changed = 0
    skipped = 0

    for filepath in html_files:
        if process_html_file(filepath):
            print(f"✓ Updated: {filepath.relative_to(website_dir)}")
            changed += 1
        else:
            skipped += 1

    print(f"\nDone: {changed} files changed, {skipped} files unchanged")

if __name__ == "__main__":
    main()
