#!/usr/bin/env bash
# Prints every freebies/src/*.html to freebies/pdf/*.pdf with headless Chrome.
# Usage: bash freebies/build.sh [name-without-extension]
set -euo pipefail
here="$(cd "$(dirname "$0")" && pwd)"
chrome="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
mkdir -p "$here/pdf"
for src in "$here"/src/${1:-*}.html; do
  name="$(basename "$src" .html)"
  "$chrome" --headless=new --disable-gpu --no-pdf-header-footer \
    --allow-file-access-from-files --virtual-time-budget=5000 \
    --print-to-pdf="$here/pdf/$name.pdf" "file://$src" 2>/dev/null
  echo "built pdf/$name.pdf"
done
