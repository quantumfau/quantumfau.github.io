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

build_page "index"         "Quantum Development Club | Florida Atlantic University" "FAU's student club connecting technical and business students to build quantum computing and AI projects."
build_page "about"         "About | Quantum Development Club at FAU" "Our mission: connect technical and business students at FAU to build quantum and AI projects together."
build_page "programs"      "Programs | Quantum Development Club at FAU" "Explore the Technical and Business tracks and how our semester project cycle works."
build_page "projects"      "Projects | Quantum Development Club at FAU" "A look at the quantum computing and applied AI projects our pods have built."
build_page "opportunities" "Opportunities | Quantum Development Club at FAU" "How club projects turn into academic, conference, and internship opportunities."
build_page "team"          "Team | Quantum Development Club at FAU" "Meet the officer team running the Quantum Development Club at FAU."
build_page "contact"       "Contact | Quantum Development Club at FAU" "Get in touch about sponsorships, partnerships, speaking, or media."
build_page "join"          "Join | Quantum Development Club at FAU" "Apply to join the Quantum Development Club at Florida Atlantic University."

echo "All pages built."
