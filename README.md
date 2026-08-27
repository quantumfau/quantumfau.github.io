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
| `contact.html` | Contact info + membership interest form |

## Project structure

```
.
├── index.html            Home
├── about.html             Mission, who it's for
├── contact.html           Contact info + membership interest form
├── css/style.css          Design system (dark, Apple-inspired theme)
├── js/main.js             Nav toggle, scroll reveals, rotating 3D atom visual
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

## Connect the contact form to your email

The form on `contact.html` posts to [Formspree](https://formspree.io), a free
service that emails you every submission with no backend of your own to run.
It needs a one-time, ~2-minute setup:

1. Go to [formspree.io](https://formspree.io) and create a free account
   using **ktsekhmayste2022@fau.edu** (or any account, then add that address
   as the form's notification email in step 3).
2. Click **New Form**, name it (e.g. "QDC Sign-Ups"), and copy the endpoint
   it gives you — it looks like `https://formspree.io/f/abcd1234`.
3. In `_content/contact.html`, replace `your-form-id` in
   `action="https://formspree.io/f/your-form-id"` with your real ID.
4. Run `./_build.sh` to regenerate `contact.html` with the updated action
   URL, then commit and push.
5. Submit the form once yourself — Formspree sends a one-time confirmation
   email the first time; after you confirm, every future submission is
   emailed to you automatically, with the submitter's own address set as
   Reply-To so you can respond directly.

Prefer Google Forms instead? Swap the `<form>` block for an embedded Google
Form iframe — no other changes needed.

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
- The hero visual (`#qc-bg` canvas, driven by `js/main.js`) is a rotating
  3D quantum-atom animation — three tilted orbit rings around a glowing
  nucleus, hand-rolled with no external libraries, and it respects
  `prefers-reduced-motion`.
- No frameworks, build step, or npm dependencies — easy for future officers
  to maintain regardless of their technical background.

## As the club grows

Add pages back only as they'd have something real to say — a Projects page
once a pod has actually shipped something, a Team page once officers are
elected. Resist filling pages with placeholder people or example projects;
an honest three-page site beats an elaborate one that isn't true yet.

## License

MIT — see [LICENSE](LICENSE).
