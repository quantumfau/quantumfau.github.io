# Quantum Development Club @ FAU — Launch Plan

This is the working plan behind the prototype website in this repo. It
covers both the site itself and the broader steps to get the club running.

## 1. Concept

The Quantum Development Club connects technical students (CS, engineering,
physics, math) with business students (finance, management, marketing) to
build real quantum computing and applied AI projects, and to turn that work
into academic credit, conference submissions, and internship leads. The
core idea driving every page of the site: **no student joins alone** — every
project pod pairs technical depth with business execution.

## 2. Website structure (what's built)

| Page | Purpose |
|---|---|
| Home | Hook, mission summary, track overview, calls to action |
| About | Mission, who it's for, values |
| Programs | Technical Track vs. Business Track, the semester project cycle |
| Projects | Example project showcase (placeholder until pods ship real work) |
| Opportunities | How projects become academic / conference / internship outcomes |
| Team | Officer roles (placeholder until elected) |
| Join | How to join, meeting info, membership interest form |

Tech choice: **static HTML/CSS/JS**, no framework or build step, deployed
free on **GitHub Pages**. This was the right call for a student org site —
zero hosting cost, no server to maintain, easy for future officers with
any skill level to edit, and trivially version-controlled on GitHub (which
also doubles as a public signal of the club's technical seriousness).

Design direction: dark, minimal, Apple-inspired — big confident type,
glass panels, a restrained indigo→cyan gradient accent, and a subtle
animated "quantum lattice" canvas background instead of stock photography.

## 3. Immediate next steps (before sharing the link publicly)

1. Push this repo to GitHub and turn on Pages (exact commands in `README.md`).
2. Wire up the `join.html` form to a real backend (Formspree free tier is
   fastest; a Google Form is a fine alternative if you'd rather manage
   responses in Sheets).
3. Replace placeholder contact email, meeting time/location, and social
   links (`_partials/footer.html`, `join.html`).
4. Swap officer placeholders on `team.html` for real names once elected.
5. Get the club officially registered with FAU Student Government / Owl
   Central (needed for room bookings, funding requests, and official
   recognition) — the site can link to your Owl Central page once live.

## 4. Content roadmap (first semester)

- Recruit an initial officer team spanning both technical and business
  colleges (President, VP Technical, VP Business, Treasurer, Events,
  Marketing — matches the placeholders on `team.html`).
- Run 1–2 kickoff info sessions to recruit founding members from CS,
  physics, engineering, and business departments.
- Form the first 2–3 project pods and scope one shippable project each
  (see `programs.html` for the suggested 15-week cycle).
- Identify 1–2 target outputs per pod early: a student conference
  (regional quantum computing meetups, undergraduate research
  symposiums), a case competition, or a faculty-mentored research credit.
- Start faculty outreach in physics, CS, and business departments for
  potential advisors and research collaborators.
- Reach out to potential sponsors (local tech companies, FAU's Tech
  Runway incubator, quantum computing vendors with academic programs)
  once there's a project or two to show.

## 5. Growth ideas beyond the prototype (later)

- Blog / project log section once pods start shipping, so the Projects
  page reflects real work instead of placeholders.
- Public Discord or Slack, linked from the footer, as the club's real-time
  hub (the site stays the front door, not the daily tool).
- A simple internal dashboard for officers to track pod progress against
  the semester cycle (could be a second, private page or a shared doc —
  not necessary for the public site).
- Alumni page once the club has a track record, to support internship
  and reference networking.

## 6. What this prototype intentionally does NOT include

- No real names, photos, or contact details beyond a placeholder email —
  avoid publishing anything before it's confirmed accurate.
- No fabricated stats (membership counts, "founded in ___," etc.) —
  every number on the site is either structural (e.g., "3 opportunity
  tracks") or clearly a placeholder to replace.
- No backend — the "form" on `join.html` needs a real submission endpoint
  before launch (see step 2 above).
