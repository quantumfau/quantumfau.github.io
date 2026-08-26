# Quantum Development Club @ FAU — Website

Prototype website for the **Quantum Development Club** at Florida Atlantic
University — a student organization connecting technical and business
students to build working quantum computing and AI projects, and turning
that work into academic, conference, and internship opportunities.

Plain HTML/CSS/JS, no build tools or frameworks required. Designed to be
hosted for free on **GitHub Pages**.

## Project structure

```
.
├── index.html            Home
├── about.html            Mission, values, who it's for
├── programs.html         Technical & Business tracks, project cycle
├── projects.html         Example project showcase (placeholder content)
├── opportunities.html    Academic / conference / internship pathways
├── team.html             Officer team (placeholder roles)
├── contact.html          Sponsorship / speaker / media / faculty inquiry form
├── join.html             How to join + membership interest form
├── css/style.css         Design system (dark, Apple-inspired theme)
├── js/main.js            Nav toggle, scroll animations, canvas background
├── assets/favicon.svg           Site icon (quantum "atom" mark)
├── assets/logo-mark.svg         Icon only, transparent background
├── assets/logo-lockup-dark.svg  Icon + wordmark, for dark backgrounds
├── assets/logo-lockup-light.svg Icon + wordmark, for light backgrounds
├── assets/png/                  PNG exports (social avatars, app icons, decks)
├── _partials/            Shared nav/head/footer templates (authoring only)
├── _content/             Per-page main content (authoring only)
└── _build.sh             Regenerates *.html from _partials + _content
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

## Deploy to GitHub Pages

1. Create a new repository on GitHub (e.g. `quantum-dev-club-fau`) — don't
   initialize it with a README, since this folder already has one.
2. From inside this folder, push it up:

   ```bash
   git init
   git add .
   git commit -m "Initial site"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo>.git
   git push -u origin main
   ```

3. On GitHub, go to **Settings → Pages**.
4. Under **Build and deployment → Source**, choose **Deploy from a branch**.
5. Set **Branch** to `main` and folder to `/ (root)`, then **Save**.
6. GitHub will publish the site at:
   `https://<your-username>.github.io/<your-repo>/`
   (takes a minute or two after the first push).

If you want a shorter URL like `quantumdevclub.fau.edu` or a custom domain,
add a `CNAME` file with that domain, point its DNS at GitHub Pages, and set
the custom domain under the same Pages settings.

## Connect the forms to your email

Both forms — the membership application on `join.html` and the sponsorship
/ speaker / media inquiry form on `contact.html` — post to
[Formspree](https://formspree.io), a free service that emails you every
submission with no backend of your own to run. Formspree recently retired
its old "just put an email in the URL" trick, so a real (free) form ID is
needed:

1. Go to [formspree.io](https://formspree.io) and create a free account
   using **ktsekhmayste2022@fau.edu** (or any account, then add that address
   as the form's notification email in step 3).
2. Click **New Form**, name it (e.g. "QDC Membership"), and copy the
   endpoint it gives you — it looks like `https://formspree.io/f/abcd1234`.
3. In `_content/join.html`, replace `your-form-id` in
   `action="https://formspree.io/f/your-form-id"` with your real ID. Do the
   same for `_content/contact.html` (the free plan supports one form; if
   you're on it, you can point both forms at the same ID — each email will
   still say which form it came from via the hidden `_subject` field, and
   you can add more forms on a paid plan).
4. Run `./_build.sh` to regenerate `join.html` and `contact.html` with the
   updated action URL, then commit and push.
5. Submit each form once yourself — Formspree sends a one-time confirmation
   email the first time; after you confirm, every future submission is
   emailed to you automatically, with the submitter's own address set as
   Reply-To so you can respond directly.

Prefer Google Forms instead? Swap the whole `<form>` block for an embedded
Google Form iframe — no code changes needed elsewhere on the site.

## Before you launch — remaining placeholders

- **Meeting time & location** (`join.html`): currently "Thursdays,
  6:00–7:00 PM" / "Location: TBD".
- **Social links** (`_partials/footer.html`): Instagram, LinkedIn, GitHub,
  and Discord links are placeholders (`#` or generic GitHub URL).
- **Team page** (`team.html`): officer roles are placeholders — swap in
  real names, photos, and bios once elected.
- **Projects page** (`projects.html`): example projects are illustrative —
  replace with real project write-ups as pods ship work.
- **Contact email**: currently set to `ktsekhmayste2022@fau.edu` everywhere
  (footer, join page, contact page). Swap to a dedicated club inbox (e.g. a
  Google Group) once one exists, so the address doesn't depend on one
  officer's personal account.

## Logo

`assets/logo-mark.svg` is the icon alone (transparent background) — use it
anywhere you need just the mark. `assets/logo-lockup-dark.svg` and
`-light.svg` pair the icon with the wordmark for dark or light backgrounds
(decks, printed materials, a sponsor one-pager). `assets/png/` has rasterized
versions: `logo-icon-512.png` / `logo-icon-1024.png` for social profile
photos or a Discord server icon, `apple-touch-icon.png` (180×180) for mobile
home-screen icons, and PNG copies of both lockups. All are regenerable from
the SVGs with `rsvg-convert` (see git history for the exact commands) if you
ever need a different size.

## Tech notes

- Single shared stylesheet (`css/style.css`) using CSS custom properties —
  change the values in `:root` to retheme the whole site.
- The animated background (`#qc-bg` canvas, driven by `js/main.js`) is a
  lightweight particle-network effect with no external dependencies, and
  respects `prefers-reduced-motion`.
- No frameworks, build step, or npm dependencies — easy for future officers
  to maintain regardless of their technical background.

## License

MIT — see [LICENSE](LICENSE).
