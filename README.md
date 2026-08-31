# Quantum Development Club @ FAU — Website

Website for the **Quantum Development Club** at Florida Atlantic University —
a new student organization connecting students across every discipline to
explore quantum computing and applied AI.

Plain HTML/CSS/JS, no build tools or frameworks required. Hosted free on
**GitHub Pages**.

**Live site:** https://quantumfau.github.io/
**Repo:** https://github.com/quantumfau/quantumfau.github.io

Three pages, on purpose — this is a new club, so the site only says things
that are actually true right now:

| Page | Purpose |
|---|---|
| `index.html` | Home — what the club is, one sentence, one call to action |
| `about.html` | Mission and who it's for |
| `contact.html` | Contact info + WhatsApp join + QR code |

## Project structure

```
.
├── index.html            Home
├── about.html             Mission, who it's for
├── contact.html           Contact info + WhatsApp join + QR code
├── css/style.css          Design system (dark, Apple-inspired theme)
├── js/main.js             Nav toggle, scroll reveals, scroll-driven quantum-computer background
├── assets/favicon.svg           Site icon (quantum "atom" mark)
├── assets/logo-mark.svg         Icon only, transparent background
├── assets/logo-lockup-dark.svg  Icon + wordmark, for dark backgrounds
├── assets/logo-lockup-light.svg Icon + wordmark, for light backgrounds
├── assets/png/                  PNG exports (social avatars, app icons, decks)
├── _partials/             Shared nav/head/footer templates (authoring only)
├── _content/              Per-page main content (authoring only)
└── _build.sh              Regenerates *.html from _partials + _content
```

`_partials/`, `_content/`, and `_build.sh` are **authoring tools**, not
required for the site to run — GitHub Pages just serves the top-level
`*.html`, `css/`, and `js/` files as-is. Keep them if you want an easy way to
update the shared nav/footer across every page at once (edit the partial,
run `./_build.sh`, commit the regenerated pages). Delete them if you'd
rather edit each page's HTML directly.

## Preview locally

No install needed — any static file server works:

```bash
cd qdc-fau-site
python3 -m http.server 8000
# open http://localhost:8000
```

## Making changes and pushing them live

The repo is already created and connected to GitHub Pages (branch `main`,
root folder) — a push to `main` goes live within a minute or two, no extra
setup needed. To edit a page: change its file under `_content/`, run
`./_build.sh` to regenerate the static HTML, then:

```bash
git add -A
git commit -m "describe the change"
git push
```

## How people join

The Contact page (and the "Join now" buttons throughout the site) send people
straight to the club's **WhatsApp group** — a "Join the WhatsApp group" button
and a scannable QR code, no backend or form service required. To point these at
a different invite link, update the `https://chat.whatsapp.com/...` URL in
`_partials/nav.html` (if used), `_partials/footer.html`, `_content/index.html`,
`_content/about.html`, and `_content/contact.html`, regenerate the QR image at
`assets/img/whatsapp-qr.png`, then run `./_build.sh`, commit, and push.

## Logo

`assets/logo-mark.svg` is the icon alone (transparent background) — use it
anywhere you need just the mark. `assets/logo-lockup-dark.svg` and
`-light.svg` pair the icon with the wordmark for dark or light backgrounds
(decks, printed materials, a sponsor one-pager). `assets/png/` has rasterized
versions: `logo-icon-512.png` / `logo-icon-1024.png` for social profile
photos or a Discord server icon, `apple-touch-icon.png` (180×180) for mobile
home-screen icons, and PNG copies of both lockups.

## Tech notes

- Single shared stylesheet (`css/style.css`) using CSS custom properties —
  change the values in `:root` to retheme the whole site.
- The home page background (`#qc-levels-bg` canvas, driven by `js/main.js`)
  is a real photographic render of a dilution-refrigerator quantum computer
  (`assets/img/quantum-computer.webp`, freely licensed via Wikimedia Commons).
  It stays intact and, on scroll, slowly zooms and pans downward toward the
  qubit chip — cinematic, no slicing. It respects `prefers-reduced-motion`
  (no idle loop; it still redraws in response to the user's own scrolling).
- No frameworks, build step, or npm dependencies — easy for future officers
  to maintain regardless of their technical background.

## As the club grows

Add pages back only as they'd have something real to say — a Projects page
once a pod has actually shipped something, a Team page once officers are
elected. Resist filling pages with placeholder people or example projects;
an honest three-page site beats an elaborate one that isn't true yet.

## License

MIT — see [LICENSE](LICENSE).
