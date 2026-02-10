#!/usr/bin/env python3
"""
Update all HTML files with favicon suite links and cookie notice
"""
import os
import re
from pathlib import Path

# Favicon links to add to <head>
FAVICON_LINKS = '''  <link rel="icon" type="image/x-icon" href="/img/favicon.ico">
  <link rel="apple-touch-icon" sizes="180x180" href="/img/apple-touch-icon.png">
  <link rel="apple-touch-icon" sizes="152x152" href="/img/apple-touch-icon-152x152.png">
  <link rel="apple-touch-icon" sizes="120x120" href="/img/apple-touch-icon-120x120.png">
  <link rel="manifest" href="/img/manifest.json">
  <meta name="theme-color" content="#111111">'''

# Cookie notice script to add before </body>
COOKIE_NOTICE_SCRIPT = '''  <script src="/js/cookie-notice.js"></script>'''

def update_html_file(filepath):
    """Update a single HTML file"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content

    # 1. Add favicon links after existing favicon.svg line if present
    # Look for existing <link rel="icon" lines
    favicon_pattern = r'(<link rel="icon" type="image/svg\+xml"[^>]*>)'
    if re.search(favicon_pattern, content):
        # Insert favicon links after the existing favicon.svg line
        content = re.sub(
            favicon_pattern,
            r'\1\n' + FAVICON_LINKS,
            content,
            count=1
        )
    else:
        # If no favicon.svg, try to add after <title> tag
        title_pattern = r'(</title>)'
        if re.search(title_pattern, content):
            content = re.sub(
                r'(  <title>[^<]*</title>)',
                r'\1\n  <link rel="icon" type="image/svg+xml" href="/img/favicon.svg">\n' + FAVICON_LINKS,
                content,
                count=1
            )

    # 2. Add cookie notice script before </body>
    if COOKIE_NOTICE_SCRIPT not in content:
        content = re.sub(
            r'(</body>)',
            '\n' + COOKIE_NOTICE_SCRIPT + '\n\\1',
            content
        )

    # Only write if content changed
    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False

def main():
    website_dir = os.path.dirname(os.path.abspath(__file__))
    html_files = []

    # Find all HTML files in root directory (not in subdirectories)
    for file in os.listdir(website_dir):
        if file.endswith('.html') and file not in ['generate_assets.py']:
            filepath = os.path.join(website_dir, file)
            if os.path.isfile(filepath):
                html_files.append(filepath)

    html_files.sort()

    updated_count = 0
    failed_files = []

    print(f"Found {len(html_files)} HTML files to update...")
    print()

    for filepath in html_files:
        filename = os.path.basename(filepath)
        try:
            if update_html_file(filepath):
                print(f"[OK] Updated: {filename}")
                updated_count += 1
            else:
                print(f"[SKIP] No changes needed: {filename}")
        except Exception as e:
            print(f"[ERROR] Failed to update {filename}: {e}")
            failed_files.append((filename, str(e)))

    print()
    print(f"Summary: {updated_count} files updated")

    if failed_files:
        print(f"Errors: {len(failed_files)} files failed")
        for filename, error in failed_files:
            print(f"  - {filename}: {error}")
    else:
        print("All files processed successfully!")

if __name__ == '__main__':
    main()
