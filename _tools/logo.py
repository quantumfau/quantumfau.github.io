#!/usr/bin/env python3
"""Generate every Quantum Development Club logo file from one geometry.

The mark ("superposition"): two overlapping rings, |0> in purple and |1> in
cyan, with the shared lens filled by the club gradient.

    python3 _tools/logo.py          # writes SVGs into assets/
    python3 _tools/logo.py --png    # also renders PNGs with headless Chrome
"""
import math
import os
import subprocess
import sys
import tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ASSETS = os.path.join(ROOT, "assets")
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

# Geometry in a 40x40 box.
R = 12.0          # ring radius
DX = 6.0          # half the distance between ring centres
SW = 2.6          # ring stroke width
CY = 20.0
LX, RX = 20 - DX, 20 + DX
HALF_CHORD = (R * R - DX * DX) ** 0.5
TOP, BOT = CY - HALF_CHORD, CY + HALF_CHORD

DARK = ("#8f5cff", "#3f9bff", "#22e6ff")    # on black (site, socials)
LIGHT = ("#7a3cff", "#2f7fe0", "#0aa5c8")   # on white (print, docs)
FONT = ("-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', "
        "Helvetica, Arial, sans-serif")


def lens_path():
    return (f"M20,{TOP:.2f} A{R:g},{R:g} 0 0 1 20,{BOT:.2f} "
            f"A{R:g},{R:g} 0 0 1 20,{TOP:.2f}Z")


def over_arc(spread_deg=24):
    """Purple ring's arc around the top crossing, redrawn above the cyan ring
    so the rings interlock (purple over at the top, cyan over at the bottom)."""
    a = math.atan2(TOP - CY, 20 - LX)
    d = math.radians(spread_deg)
    p1 = (LX + R * math.cos(a - d), CY + R * math.sin(a - d))
    p2 = (LX + R * math.cos(a + d), CY + R * math.sin(a + d))
    return f"M{p1[0]:.3f},{p1[1]:.3f} A{R:g},{R:g} 0 0 1 {p2[0]:.3f},{p2[1]:.3f}"


def mark(gid, colors, transform=""):
    """The mark as an SVG fragment (defs + group) in the 40x40 box."""
    a, b, c = colors
    t = f' transform="{transform}"' if transform else ""
    return (
        f'<defs><linearGradient id="{gid}" x1="{LX}" y1="0" x2="{RX}" y2="0" '
        f'gradientUnits="userSpaceOnUse"><stop stop-color="{a}"/>'
        f'<stop offset="0.5" stop-color="{b}"/><stop offset="1" stop-color="{c}"/>'
        f'</linearGradient></defs>'
        f'<g{t}>'
        f'<path d="{lens_path()}" fill="url(#{gid})"/>'
        f'<circle cx="{LX}" cy="{CY}" r="{R:g}" fill="none" stroke="{a}" stroke-width="{SW}"/>'
        f'<circle cx="{RX}" cy="{CY}" r="{R:g}" fill="none" stroke="{c}" stroke-width="{SW}"/>'
        f'<path d="{over_arc()}" fill="none" stroke="{a}" stroke-width="{SW}"/>'
        f'</g>'
    )


def mark_mono(sw=1.8):
    """Single-colour version (currentColor) for small decorative icons."""
    return (
        f'<path d="{lens_path()}" fill="currentColor" stroke="none"/>'
        f'<circle cx="{LX}" cy="{CY}" r="{R:g}"/><circle cx="{RX}" cy="{CY}" r="{R:g}"/>'
    )


def svg(w, h, body, extra=""):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" '
            f'width="{w}" height="{h}"{extra}>{body}</svg>\n')


def icon(size_units=40, rounded=0):
    """Black square with the mark at ~62% width (safe inside a circle crop)."""
    s = 0.62 * 40 / (2 * (DX + R) + SW)          # scale so mark spans 62%
    off = 20 - 20 * s
    bg = f'<rect width="40" height="40" rx="{rounded}" fill="#000"/>'
    return svg(40, 40, bg + mark("qdcIconGrad", DARK, f"translate({off:.3f} {off:.3f}) scale({s:.4f})"))


def lockup(colors, text_fill, gid):
    body = (mark(gid, colors, "translate(0 6) scale(1.1)") +
            f'<text x="60" y="35" font-family="{FONT}" font-size="25" font-weight="700" '
            f'letter-spacing="-0.5" fill="{text_fill}">Quantum Development Club</text>')
    return svg(460, 56, body)


def write(name, text):
    with open(os.path.join(ASSETS, name), "w") as f:
        f.write(text)
    print("wrote assets/" + name)


def render_png(svg_name, out_name, w, h):
    src = os.path.join(ASSETS, svg_name)
    out = os.path.join(ASSETS, "png", out_name)
    with tempfile.TemporaryDirectory() as d:
        page = os.path.join(d, "p.html")
        with open(page, "w") as f:
            f.write(f'<html><body style="margin:0;background:transparent">'
                    f'<img src="file://{src}" style="width:{w}px;height:{h}px;display:block">'
                    f'</body></html>')
        subprocess.run([CHROME, "--headless=new", "--disable-gpu", "--hide-scrollbars",
                        "--force-device-scale-factor=1", "--default-background-color=00000000",
                        f"--window-size={w},{h}", f"--screenshot={out}", "file://" + page],
                       check=True, capture_output=True)
    print(f"rendered assets/png/{out_name} ({w}x{h})")


def main():
    write("logo-mark.svg", svg(40, 40, mark("qdcMarkGrad", DARK)))
    write("logo-mark-light.svg", svg(40, 40, mark("qdcMarkGradLight", LIGHT)))
    write("favicon.svg", svg(40, 40, '<rect width="40" height="40" rx="9" fill="#000"/>' +
                             mark("favGrad", DARK, "translate(2.4 2.4) scale(0.88)")))
    write("logo-icon.svg", icon())
    write("logo-lockup-dark.svg", lockup(DARK, "#f5f5f7", "qdcLockupGradDark"))
    write("logo-lockup-light.svg", lockup(LIGHT, "#1d1d1f", "qdcLockupGradLight"))
    if "--png" in sys.argv:
        render_png("logo-mark.svg", "logo-mark.png", 800, 800)
        render_png("logo-icon.svg", "logo-icon-1024.png", 1024, 1024)
        render_png("logo-icon.svg", "logo-icon-512.png", 512, 512)
        render_png("logo-icon.svg", "apple-touch-icon.png", 180, 180)
        render_png("logo-icon.svg", "profile-picture-1080.png", 1080, 1080)
        render_png("logo-lockup-dark.svg", "logo-lockup-dark.png", 920, 112)
        render_png("logo-lockup-light.svg", "logo-lockup-light.png", 920, 112)


if __name__ == "__main__":
    main()
