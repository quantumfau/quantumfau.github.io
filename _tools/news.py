#!/usr/bin/env python3
"""News page for quantumfau.github.io.

  python3 _tools/news.py fetch    # read FAU News Desk, add new quantum articles to news.json
  python3 _tools/news.py render   # rebuild _content/news.html from news.json

The GitHub Action (.github/workflows/news.yml) runs both daily, then _build.sh, and commits.
To hide an auto-added story, put its URL in news.json "blocked_urls".
Only uses the Python standard library.
"""
import datetime, html, json, os, re, sys, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "news.json")
OUT = os.path.join(ROOT, "_content", "news.html")
FEED = "https://www.fau.edu/newsdesk/all/index.php?page={}"
PAGES = 3                      # ~30 newest FAU articles checked each run
KEYWORD = re.compile(r"\bquantum\b", re.I)
TAGS = [  # first match wins
    (r"\b(course|certificate|curriculum|class|degree|academy|internship|students?)\b", "Education"),
    (r"\b(professor|director|appoint|named|hire|leader|book)\b", "Leadership"),
    (r"\b(encrypt|cryptograph|security|cyber)\w*", "Cryptography"),
    (r"\b(d-wave|advantage2|hardware|qubits?|processor)\b", "Hardware"),
    (r"\b(grant|funding|award|nsf)\b", "Funding"),
    (r"\b(study|research|researchers|framework|model|algorithm)\b", "Research"),
]

def norm(u):
    u = u.strip().split("#")[0].split("?")[0].rstrip("/")
    return re.sub(r"\.php$", "", u.replace("http://", "https://"))

def load():
    with open(DATA, encoding="utf-8") as f: return json.load(f)

def save(d):
    with open(DATA, "w", encoding="utf-8") as f:
        json.dump(d, f, indent=2, ensure_ascii=False); f.write("\n")

def get(url):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (QDC news updater; quantumfau.github.io)"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read().decode("utf-8", "replace")

def parse(page_html):
    """FAU News Desk list page -> [{title,url,date,summary}] (schema.org NewsArticle markup)."""
    out = []
    for blk in page_html.split('class="list-view__result"')[1:]:
        t = re.search(r'itemprop="headline"><a href="([^"]+)"[^>]*>(.*?)</a>', blk, re.S)
        d = re.search(r'\|\s*<span>([^<]+)</span>', blk)
        s = re.search(r'itemprop="description">(.*?)</p>', blk, re.S)
        if not t: continue
        clean = lambda x: html.unescape(re.sub(r"<[^>]+>", "", re.sub(r"\s+", " ", x))).strip()
        try: date = datetime.datetime.strptime(d.group(1).strip(), "%B %d, %Y").date().isoformat() if d else ""
        except ValueError: date = ""
        out.append({"title": clean(t.group(2)), "url": t.group(1).strip(), "date": date,
                    "summary": clean(s.group(1)) if s else ""})
    return out

def tag_for(text):
    for pat, tag in TAGS:
        if re.search(pat, text, re.I): return tag
    return "FAU News"

def fetch():
    d = load()
    known = {norm(i["url"]) for i in d["items"]} | {norm(u) for u in d.get("blocked_urls", [])}
    added = []
    for p in range(1, PAGES + 1):
        try: arts = parse(get(FEED.format(p)))
        except Exception as e:
            print(f"page {p}: {e}", file=sys.stderr); continue
        for a in arts:
            if not KEYWORD.search(a["title"] + " " + a["summary"]) or norm(a["url"]) in known: continue
            item = {"date": a["date"] or datetime.date.today().isoformat(), "tag": tag_for(a["title"] + " " + a["summary"]),
                    "title": a["title"], "summary": a["summary"], "url": a["url"], "source": "FAU News Desk", "auto": True}
            d["items"].append(item); known.add(norm(a["url"])); added.append(item)
    if added:  # only touch the file (and trigger a site update) when there's something new
        d["last_checked"] = datetime.date.today().isoformat()
        save(d)
    if os.environ.get("GITHUB_OUTPUT"):
        with open(os.environ["GITHUB_OUTPUT"], "a") as f: f.write(f"added={len(added)}\n")
    print(f"added {len(added)} new article(s)" + "".join(f"\n  + {i['date']} {i['title']}" for i in added))

# ---------------------------------------------------------------- render
CHEV = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg>'
ORB = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><ellipse cx="12" cy="12" rx="9.8" ry="4.1"/><ellipse cx="12" cy="12" rx="9.8" ry="4.1" transform="rotate(58 12 12)"/><circle cx="12" cy="12" r="2.1" fill="currentColor"/></svg>'
e = lambda s: html.escape(s or "", quote=True)

def nice(iso):
    try: return datetime.date.fromisoformat(iso).strftime("%b %-d, %Y")
    except Exception: return ""

def link(i, text="Read more"):
    ext = "" if not i["url"].startswith("http") else ' target="_blank" rel="noopener"'
    return f'<a href="{e(i["url"])}"{ext} class="link-chevron">{e(i.get("link_text") or text)} {CHEV}</a>'

def meta(i):
    bits = [nice(i.get("date", "")), i.get("source", "")]
    return " &#183; ".join(e(b) for b in bits if b)

def card(i):
    return f'''        <article class="card reveal">
          <span class="card-tag">{e(i["tag"])}</span>
          <h3><a href="{e(i["url"])}"{'' if not i["url"].startswith("http") else ' target="_blank" rel="noopener"'}>{e(i["title"])}</a></h3>
          <p style="font-family:var(--font-text);color:var(--text-tertiary);font-size:13px;margin:-2px 0 8px;">{meta(i)}</p>
          <p>{e(i["summary"])}</p>
          <p style="margin-top:16px;">{link(i)}</p>
        </article>'''

def render():
    d = load()
    blocked = {norm(u) for u in d.get("blocked_urls", [])}
    items = sorted((i for i in d["items"] if norm(i["url"]) not in blocked), key=lambda i: i.get("date", ""), reverse=True)
    club = [i for i in items if i["tag"] == "Club"]
    news = [i for i in items if i["tag"] != "Club"]
    feat, rest = (news[0], news[1:]) if news else (None, [])
    parts = [f'''<main>

  <div class="page-header">
    <div class="container">
      <div class="mini-orb reveal in">{ORB}</div>
      <span class="kicker reveal in">News</span>
      <h1 class="reveal in">What's happening in <span class="gradient-text">quantum at FAU</span></h1>
      <p class="reveal in">Florida Atlantic is building one of the most ambitious university quantum programs in the country. Here's what's new, and why it's a good time to get involved.</p>
    </div>
  </div>
''']
    if club:
        parts.append('''  <!-- From the club -->
  <section class="tight">
    <div class="container">
      <div class="section-head">
        <span class="kicker reveal">From the club</span>
        <h2 class="reveal">Coming up with QDC</h2>
      </div>
      <div class="grid grid-2">
''' + "\n".join(card(i) for i in club) + '''
      </div>
    </div>
  </section>
''')
    if feat:
        parts.append(f'''  <!-- Featured: newest story -->
  <section class="tight">
    <div class="container">
      <div class="card reveal" style="max-width:820px;margin:0 auto;padding:44px 48px;background:radial-gradient(120% 160% at 15% 0%, rgba(123,92,255,0.16), rgba(16,16,19,0) 55%), var(--surface);">
        <span class="card-tag" style="color:var(--accent-cyan);">Latest &#183; {e(feat["tag"])}</span>
        <h2 style="font-size:clamp(24px,3vw,32px);font-weight:700;margin-bottom:8px;">{e(feat["title"])}</h2>
        <p style="font-family:var(--font-text);color:var(--text-tertiary);font-size:13.5px;margin-bottom:14px;">{meta(feat)}</p>
        <p style="font-size:16.5px;max-width:640px;">{e(feat["summary"])}</p>
        <p style="margin-top:20px;">{link(feat, "Read the story")}</p>
      </div>
    </div>
  </section>
''')
    if rest:
        parts.append('''  <!-- More news, newest first -->
  <section>
    <div class="container">
      <div class="section-head">
        <span class="kicker reveal">More from FAU quantum</span>
        <h2 class="reveal">The bigger picture</h2>
        <p class="reveal">The research, hardware, and people putting FAU on the quantum map, newest first.</p>
      </div>
      <div class="grid grid-2">
''' + "\n".join(card(i) for i in rest) + '''
      </div>
    </div>
  </section>
''')
    ev = d.get("evergreen", [])
    if ev:
        parts.append('''  <!-- Evergreen -->
  <section class="tight">
    <div class="container">
      <div class="section-head">
        <span class="kicker reveal">Explore</span>
        <h2 class="reveal">Quantum across FAU</h2>
      </div>
      <div class="grid grid-2">
''' + "\n".join(card(dict(i, date="", source="")) for i in ev) + '''
      </div>
    </div>
  </section>
''')
    parts.append(f'''  <p class="reveal" style="text-align:center;color:var(--text-tertiary);font-size:13px;margin:0 0 40px;">Checked daily against the FAU News Desk &#183; last new story added {e(nice(d.get("last_checked", "")))}</p>

  <section>
    <div class="container">
      <div class="cta-band reveal">
        <h2>Want to be part of it?</h2>
        <p>FAU's quantum scene is moving fast. Join the club and grow with it.</p>
        <div class="hero-actions">
          <a href="https://chat.whatsapp.com/LAW8ps6Jjb59WcjlVSt32g?s=cl&amp;p=i&amp;mlu=4" target="_blank" rel="noopener" class="btn btn-gradient">Join now</a>
          <a href="about.html" class="link-chevron">About the club {CHEV}</a>
        </div>
      </div>
    </div>
  </section>

</main>
''')
    with open(OUT, "w", encoding="utf-8") as f: f.write("\n".join(parts))
    print(f"rendered news page: {len(club)} club, {len(news)} news, {len(ev)} evergreen")

if __name__ == "__main__":
    {"fetch": fetch, "render": render}.get(sys.argv[1] if len(sys.argv) > 1 else "", lambda: sys.exit(__doc__))()
