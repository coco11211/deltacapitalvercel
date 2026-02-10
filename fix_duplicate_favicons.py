#!/usr/bin/env python3
"""
Fix duplicate favicon links in HTML files
"""
import os
import re
from pathlib import Path

def fix_duplicate_favicons(filepath):
    """Remove duplicate favicon links"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content

    # Pattern to find and remove duplicate favicon lines
    # This removes duplicate consecutive favicon/apple-touch/manifest/theme-color lines
    lines = content.split('\n')
    seen_favicon_lines = set()
    fixed_lines = []

    for line in lines:
        # Check if this is a favicon/apple-touch/manifest/theme-color line
        is_favicon_line = any([
            '<link rel="icon"' in line,
            '<link rel="apple-touch-icon"' in line,
            '<link rel="manifest"' in line,
            '<meta name="theme-color"' in line,
        ])

        if is_favicon_line:
            # Use the line as a key (strip whitespace for comparison)
            line_key = line.strip()
            if line_key in seen_favicon_lines:
                # Skip duplicate
                continue
            seen_favicon_lines.add(line_key)

        fixed_lines.append(line)

    content = '\n'.join(fixed_lines)

    # Write if changed
    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False

def main():
    website_dir = os.path.dirname(os.path.abspath(__file__))
    html_files = []

    # Find all HTML files
    for file in os.listdir(website_dir):
        if file.endswith('.html'):
            filepath = os.path.join(website_dir, file)
            if os.path.isfile(filepath):
                html_files.append(filepath)

    html_files.sort()

    fixed_count = 0

    print("Fixing duplicate favicon links...")
    print()

    for filepath in html_files:
        filename = os.path.basename(filepath)
        try:
            if fix_duplicate_favicons(filepath):
                print(f"[FIXED] {filename}")
                fixed_count += 1
            else:
                print(f"[OK] {filename}")
        except Exception as e:
            print(f"[ERROR] {filename}: {e}")

    print()
    print(f"Fixed {fixed_count} files with duplicates")

if __name__ == '__main__':
    main()
