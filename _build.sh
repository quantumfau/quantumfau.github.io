#!/usr/bin/env bash
# Authoring-time build script: assembles final static HTML pages from
# _partials/ and _content/. Not needed by GitHub Pages at runtime —
# the committed *.html files are plain static output.
set -euo pipefail
cd "$(dirname "$0")"

build_page () {
  local slug="$1" title="$2" desc="$3"
  sed -e "s#__TITLE__#${title}#g" -e "s#__DESC__#${desc}#g" _partials/head.tpl > "${slug}.html"
  cat _partials/nav.html >> "${slug}.html"
  cat "_content/${slug}.html" >> "${slug}.html"
  cat _partials/footer.html >> "${slug}.html"
  echo "built ${slug}.html"
}

build_page "index"   "Quantum Development Club | Florida Atlantic University" "FAU's new student club connecting every discipline to build quantum computing and AI projects."
build_page "about"   "About | Quantum Development Club at FAU" "Our mission: connect students across every discipline at FAU to build quantum and AI projects together."
build_page "news"    "News | Quantum Development Club at FAU" "The latest in quantum at Florida Atlantic University, including FAU's new quantum computing business course."
build_page "contact" "Contact | Quantum Development Club at FAU" "Get in touch with the Quantum Development Club at Florida Atlantic University, or sign up to join."

echo "All pages built."
