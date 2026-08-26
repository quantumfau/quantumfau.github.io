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
├── join.html             How to join + membership interest form
├── css/style.css         Design system (dark, Apple-inspired theme)
├── js/main.js            Nav toggle, scroll animations, canvas background
├── assets/favicon.svg    Site icon (quantum "atom" mark)
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

## Before you launch — placeholders to replace

- **Membership form** (`join.html`): the form currently posts to
  `https://formspree.io/f/your-form-id`. Create a free
  [Formspree](https://formspree.io) endpoint (or a Google Form) and swap in
  the real `action` URL.
- **Contact email**: replace `quantumdevclub@fau.edu` in `join.html` and
  `_partials/footer.html` with the club's real inbox.
- **Meeting time & location** (`join.html`): currently "Thursdays,
  6:00–7:00 PM" / "Location: TBD".
- **Social links** (`_partials/footer.html`): Instagram, LinkedIn, GitHub,
  and Discord links are placeholders (`#` or generic GitHub URL).
- **Team page** (`team.html`): officer roles are placeholders — swap in
  real names, photos, and bios once elected.
- **Projects page** (`projects.html`): example projects are illustrative —
  replace with real project write-ups as pods ship work.

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
