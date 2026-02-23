#!/usr/bin/env python3
import re
import os

# Updated footer nav with tools link
NEW_FOOTER_NAV = '''<footer class="page-footer">
      <nav class="footer-nav">
        <a href="/" class="active">Home</a>
        <a href="/principles">Principles</a>
        <a href="/mission">Mission</a>
        <a href="/screener">Screener</a>
        <a href="/tools">Tools</a>
        <a href="/blog">Blog</a>
        <a href="/glossary">Glossary</a>
        <a href="/calculators">Calculators</a>
        <a href="/simulator">Strategy Simulator</a>
        <a href="/visualizations">Visualizations</a>
        <a href="/disclosures">Disclosures</a>
        <a href="/faq">Questions</a>
        <a href="/careers">Careers</a>
        <a href="/newsletter">Updates</a>
        <a href="/contact">Contact</a>
      </nav>
      <div class="footer-bottom">
        <span>&Delta; Capital &copy; 2026</span>
        <span>All rights reserved</span>
      </div>
    </footer>'''

def update_footers():
    """Update footer on all HTML files to include tools link"""
    html_files = []
    for root, dirs, files in os.walk('.'):
        for file in files:
            if file.endswith('.html'):
                html_files.append(os.path.join(root, file))
    
    updated_count = 0
    for html_file in html_files:
        try:
            with open(html_file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Find footer section and replace
            if '<footer class="page-footer">' in content:
                # Extract current footer
                footer_pattern = r'(<footer class="page-footer">.*?</footer>)'
                current_footer = re.search(footer_pattern, content, re.DOTALL)
                
                if current_footer:
                    content = content.replace(current_footer.group(1), NEW_FOOTER_NAV)
                    
                    with open(html_file, 'w', encoding='utf-8') as f:
                        f.write(content)
                    updated_count += 1
                    print(f"Updated: {html_file}")
                    
        except Exception as e:
            print(f"Error processing {html_file}: {e}")
    
    print(f"\nTotal HTML files processed: {len(html_files)}")
    print(f"Files updated: {updated_count}")

if __name__ == "__main__":
    update_footers()