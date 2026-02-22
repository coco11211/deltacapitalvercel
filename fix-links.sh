#!/bin/bash

# Script to remove .html extensions from links in all HTML files

echo "Removing .html extensions from links..."

# Find all HTML files and replace .html links with no extension
find . -name "*.html" -type f -exec sed -i '' \
  -e 's|href="/index\.html"|href="/"|g' \
  -e 's|href="/principles\.html"|href="/principles"|g' \
  -e 's|href="/mission\.html"|href="/mission"|g' \
  -e 's|href="/screener\.html"|href="/screener"|g' \
  -e 's|href="/blog\.html"|href="/blog"|g' \
  -e 's|href="/glossary\.html"|href="/glossary"|g' \
  -e 's|href="/disclosures\.html"|href="/disclosures"|g' \
  -e 's|href="/faq\.html"|href="/faq"|g' \
  -e 's|href="/contact\.html"|href="/contact"|g' \
  -e 's|href="/careers\.html"|href="/careers"|g' \
  -e 's|href="/newsletter\.html"|href="/newsletter"|g' \
  -e 's|href="/architecture\.html"|href="/architecture"|g' \
  -e 's|href="/contact\.html"|href="/contact"|g' \
  -e 's|href="/research\.html"|href="/research"|g' \
  -e 's|href="/risk\.html"|href="/risk"|g' \
  -e 's|href="/insights\.html"|href="/insights"|g' \
  -e 's|href="/screener\.html"|href="/screener"|g' \
  -e 's|href="/blog\.html"|href="/blog"|g' \
  -e 's|href="/glossary\.html"|href="/glossary"|g' \
  -e 's|href="/brandkit\.html"|href="/brandkit"|g' \
  -e 's|href="/disclosures\.html"|href="/disclosures"|g' \
  -e 's|href="/faq\.html"|href="/faq"|g' \
  -e 's|href="/contact\.html"|href="/contact"|g' \
  -e 's|href="/404\.html"|href="/404"|g' \
  -e 's|href="/accessibility\.html"|href="/accessibility"|g' \
  -e 's|href="/privacy\.html"|href="/privacy"|g' \
  -e 's|href="/terms\.html"|href="/terms"|g' \
  -e 's|href="/calculators\.html"|href="/calculators"|g' \
  {} \;

echo "✓ Link extensions removed"
echo ""
echo "Next: Create vercel.json for URL rewriting"