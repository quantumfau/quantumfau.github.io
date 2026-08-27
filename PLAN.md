# Quantum Development Club @ FAU — Launch Plan

This is the working plan behind the website in this repo. It covers both
the site itself and the broader steps to get the club running.

## 1. Concept

The Quantum Development Club connects students across every discipline —
technical, business, creative, and beyond — to explore quantum computing
and applied AI at FAU. It's a brand-new club, so the site is deliberately
honest about that: it says what the club is and how to join, not more.

## 2. Website structure (what's built)

Three pages, on purpose:

| Page | Purpose |
|---|---|
| Home | What the club is, in one breath, with a single call to action |
| About | Mission and who it's for |
| Contact | Contact info + membership interest form |

Earlier drafts had seven pages — Programs, Projects, Opportunities, Team,
a separate Contact page — full of placeholder officers, invented example
projects, and a fabricated meeting schedule. All of that got cut. A club this new doesn't
have a shipped project, an elected officer roster, or a weekly meeting time
yet, so the site shouldn't claim it does. Add a page back only once it has
something real to say (see Section 5).

A logo — an "atom orbit" mark (two crossing rings + a center node, gradient
indigo→cyan) — is used across the nav, footer, favicon, and both page
headers, with standalone lockup and icon files in `assets/` for use off the
website (slides, social profiles, printed materials).

Tech choice: **static HTML/CSS/JS**, no framework or build step, deployed
free on **GitHub Pages**. Zero hosting cost, no server to maintain, easy
for future officers with any skill level to edit.

Design direction: dark, minimal, Apple-inspired — huge confident type, a
restrained indigo→cyan→purple gradient accent, generous section spacing,
and a hero centerpiece that's a genuine hand-built graphic: a rotating 3D
quantum atom (three tilted, glowing orbit rings around a pulsing nucleus),
drawn live on canvas rather than a stock photo or static illustration.

## 3. Status

- Repo: https://github.com/quantumfau/quantumfau.github.io
- Live: https://quantumfau.github.io/
- Deployed via GitHub Pages from `main`, root folder — a push goes live in
  a minute or two.

## 4. Immediate next steps

1. Create the free Formspree form ID and drop it into `contact.html` — see
   "Connect the contact form to your email" in `README.md` (2-minute,
   one-time setup). It's already wired to email ktsekhmayste2022@fau.edu
   once that ID is in place.
2. Get the club officially registered with FAU Student Government / Owl
   Central (needed for room bookings, funding requests, and official
   recognition).
3. Once there's a real meeting time and location, add it to `contact.html`
   — it's intentionally left out until it's real.

## 5. Content roadmap (first semester, and when to expand the site)

- Recruit an initial officer team spanning technical, business, and
  creative colleges. Once there's a real roster, a Team page is worth
  adding back.
- Run kickoff info sessions to recruit founding members across
  departments.
- Form the first project pod(s) once there's enough interest. Once a pod
  actually ships something, a Projects page has real content to show —
  not before.
- Start faculty outreach for potential advisors and research
  collaborators.
- Reach out to potential sponsors (local tech companies, FAU's Tech Runway
  incubator, quantum computing vendors with academic programs) once there
  is a project or two to show them.

## 6. What this site intentionally does NOT include

- No placeholder officers, no invented example projects, no fabricated
  meeting schedule — anything not real yet is simply left off rather than
  filled in with a placeholder.
- No fabricated stats or numbers.
- No backend — the contact form needs a real Formspree ID before it can
  actually deliver submissions (see Section 4).
