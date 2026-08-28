/* =========================================================
   Quantum Development Club @ FAU — site behavior
   - Mobile nav toggle
   - Scroll-reveal animations
   - Full-page quantum-computer background that explodes into levels on scroll
   ========================================================= */

(function () {
  "use strict";

  /* ---------- Mobile nav ---------- */
  var toggle = document.querySelector("[data-nav-toggle]");
  var mobileMenu = document.querySelector("[data-mobile-menu]");

  if (toggle && mobileMenu) {
    toggle.addEventListener("click", function () {
      var isOpen = mobileMenu.classList.toggle("open");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    mobileMenu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        mobileMenu.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- Mark active nav link ---------- */
  var here = (location.pathname.split("/").pop() || "index.html");
  document.querySelectorAll(".nav-links a, .mobile-menu a").forEach(function (a) {
    var href = a.getAttribute("href");
    if (href === here || (here === "" && href === "index.html")) {
      a.classList.add("active");
    }
  });

  /* ---------- Scroll reveal ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealEls.length) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* ================================================================
     Full-page quantum-computer background (home only)

     A hand-rendered dilution-refrigerator cryostat — the gold "chandelier"
     you picture when you think of a quantum computer: stacked circular
     plates with real metal thickness, dense copper wire looms hanging
     between them, threaded support rods, and small modules bolted to each
     stage. It's all drawn on a full-viewport canvas pinned behind every
     section. Scrolling the page (either direction) drives how far the
     stages have separated — the machine opens up the further you scroll.
     ================================================================ */
  var canvas = document.getElementById("qc-levels-bg");
  if (!canvas || !canvas.getContext) return;

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var ctx = canvas.getContext("2d");
  var W, H, DPR;
  var t = 0;
  var targetProgress = 0;
  var currentProgress = 0;

  // Metal palettes: [r,g,b] stops from shadow → base → highlight → spark.
  var GOLD = { deep: [92, 58, 12], mid: [176, 128, 34], bright: [255, 210, 104], hi: [255, 246, 214] };
  var COPPER = { deep: [82, 40, 14], mid: [190, 108, 52], bright: [246, 170, 104], hi: [255, 226, 190] };
  var BRONZE = { deep: [34, 27, 20], mid: [86, 68, 46], bright: [150, 124, 86], hi: [206, 184, 140] };

  // Stages of the fridge, top → bottom. rFrac scales the shared base radius.
  // The top entry is the heavy vacuum flange; the rest are the gold plates.
  var STAGES = [
    { rFrac: 1.16, thick: 0.42, metal: BRONZE, flange: true },
    { rFrac: 1.00, thick: 0.16, metal: GOLD },
    { rFrac: 0.82, thick: 0.15, metal: GOLD },
    { rFrac: 0.64, thick: 0.14, metal: GOLD },
    { rFrac: 0.46, thick: 0.13, metal: GOLD }
  ];
  var TILT = 0.30;              // vertical squash of every ellipse (perspective)
  var WIRES_PER_GAP = 30;

  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    var cw = window.innerWidth;
    var ch = window.innerHeight;
    W = canvas.width = cw * DPR;
    H = canvas.height = ch * DPR;
    canvas.style.width = cw + "px";
    canvas.style.height = ch + "px";
  }

  function scrollProgress() {
    var scrubDistance = window.innerHeight * 1.4;
    return Math.min(Math.max(window.scrollY / scrubDistance, 0), 1);
  }

  function rgba(c, a) {
    return "rgba(" + c[0] + "," + c[1] + "," + c[2] + "," + a + ")";
  }
  function mix(a, b) {
    return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2];
  }
  // Deterministic pseudo-random so mounted components don't jitter frame to frame.
  function rand(seed) {
    var x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
    return x - Math.floor(x);
  }

  // A single metal plate/disk with real thickness: a curved edge band drawn
  // with cylindrical shading, capped by a metallic top face plus a specular
  // sheen and a bright rim. Light comes from the upper-left.
  function drawDisk(cx, cy, r, thick, metal, alpha) {
    var ry = r * TILT;

    // ----- edge band (the visible side of the cylinder) -----
    ctx.beginPath();
    ctx.moveTo(cx + r, cy);
    ctx.ellipse(cx, cy + thick, r, ry, 0, 0, Math.PI, false);   // bottom front arc, R→L
    ctx.lineTo(cx - r, cy);
    ctx.ellipse(cx, cy, r, ry, 0, Math.PI, 0, true);            // top front arc, L→R
    ctx.closePath();
    var edge = ctx.createLinearGradient(cx - r, cy, cx + r, cy);
    edge.addColorStop(0.0, rgba(metal.deep, alpha));
    edge.addColorStop(0.18, rgba(metal.mid, alpha));
    edge.addColorStop(0.4, rgba(metal.bright, alpha));
    edge.addColorStop(0.56, rgba(metal.mid, alpha));
    edge.addColorStop(0.8, rgba(metal.deep, alpha));
    edge.addColorStop(1.0, rgba([0, 0, 0], alpha * 0.9));
    ctx.fillStyle = edge;
    ctx.fill();
    // thin dark seam at the very bottom of the band
    ctx.strokeStyle = rgba([0, 0, 0], alpha * 0.5);
    ctx.lineWidth = 1 * DPR;
    ctx.beginPath();
    ctx.ellipse(cx, cy + thick, r, ry, 0, 0, Math.PI, false);
    ctx.stroke();

    // ----- top face -----
    ctx.beginPath();
    ctx.ellipse(cx, cy, r, ry, 0, 0, Math.PI * 2);
    var face = ctx.createLinearGradient(cx - r * 0.7, cy - ry, cx + r * 0.7, cy + ry);
    face.addColorStop(0.0, rgba(metal.hi, alpha));
    face.addColorStop(0.28, rgba(metal.bright, alpha));
    face.addColorStop(0.6, rgba(metal.mid, alpha));
    face.addColorStop(1.0, rgba(metal.deep, alpha));
    ctx.fillStyle = face;
    ctx.fill();

    // specular sweep across the top face (upper-left light)
    ctx.save();
    ctx.clip();
    var spec = ctx.createRadialGradient(
      cx - r * 0.35, cy - ry * 0.5, r * 0.05,
      cx - r * 0.35, cy - ry * 0.5, r * 1.1
    );
    spec.addColorStop(0, rgba(metal.hi, alpha * 0.55));
    spec.addColorStop(0.4, rgba(metal.hi, 0));
    ctx.fillStyle = spec;
    ctx.fillRect(cx - r, cy - ry, r * 2, ry * 2);
    ctx.restore();

    // bright rim on the lit side
    ctx.strokeStyle = rgba(metal.hi, alpha * 0.85);
    ctx.lineWidth = 1.4 * DPR;
    ctx.beginPath();
    ctx.ellipse(cx, cy, r * 0.995, ry * 0.995, 0, Math.PI * 0.95, Math.PI * 1.85);
    ctx.stroke();
  }

  // Concentric machined rings on the top flange face — the lathe-cut look.
  function flangeRings(cx, cy, r, alpha) {
    for (var i = 1; i <= 4; i++) {
      var rr = r * (0.82 - i * 0.15);
      if (rr <= 0) break;
      ctx.strokeStyle = rgba(BRONZE.hi, alpha * (0.5 - i * 0.06));
      ctx.lineWidth = 1 * DPR;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rr, rr * TILT, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  // Dense hanging wire loom between two stages: bundles of thin copper/gold
  // lines that bow outward and sag, brighter on the near (front) side.
  function drawWires(cx, y1, r1, y2, r2, sway, alpha) {
    for (var i = 0; i < WIRES_PER_GAP; i++) {
      var f = i / WIRES_PER_GAP;
      var angle = f * Math.PI * 2;
      var ca = Math.cos(angle), sa = Math.sin(angle);
      var front = (sa + 1) / 2;                       // 0 = back, 1 = front
      var jitter = (rand(i * 3.3) - 0.5) * 0.05;
      var x1 = cx + ca * r1 * (1 + jitter);
      var yy1 = y1 + sa * r1 * TILT;
      var x2 = cx + ca * r2 * (1 + jitter);
      var yy2 = y2 + sa * r2 * TILT;
      var bow = ((r1 + r2) / 2) * (1.05 + rand(i * 7.1) * 0.14) * (1 + Math.sin(sway + i) * 0.02);
      var bx = cx + ca * bow;
      var sag = (yy2 - yy1) * (0.12 + rand(i * 5.7) * 0.1);
      var col = (i % 3 === 0) ? GOLD : COPPER;
      var a = alpha * (0.28 + front * 0.62);
      ctx.strokeStyle = rgba(front > 0.5 ? col.bright : col.mid, a);
      ctx.lineWidth = (front > 0.5 ? 1.0 : 0.7) * DPR;
      ctx.beginPath();
      ctx.moveTo(x1, yy1);
      ctx.bezierCurveTo(bx, yy1 + (yy2 - yy1) * 0.35 + sag, bx, yy2 - (yy2 - yy1) * 0.2 + sag, x2, yy2);
      ctx.stroke();
    }
  }

  // Threaded vertical support rods around the perimeter, front ones brightest.
  function drawRods(cx, yTop, rTop, yBot, rBot, alpha) {
    var angles = [-0.62, 0.62, Math.PI - 0.5, Math.PI + 0.5];
    for (var i = 0; i < angles.length; i++) {
      var ca = Math.cos(angles[i]);
      var sa = Math.sin(angles[i]);
      var front = (sa + 1) / 2;
      var xt = cx + ca * rTop, yt = yTop + sa * rTop * TILT;
      var xb = cx + ca * rBot, yb = yBot + sa * rBot * TILT;
      var a = alpha * (0.3 + front * 0.6);
      var g = ctx.createLinearGradient(xt - 3 * DPR, 0, xt + 3 * DPR, 0);
      g.addColorStop(0, rgba(GOLD.deep, a));
      g.addColorStop(0.5, rgba(GOLD.bright, a));
      g.addColorStop(1, rgba(GOLD.deep, a));
      ctx.strokeStyle = g;
      ctx.lineWidth = (front > 0.5 ? 3.2 : 2) * DPR;
      ctx.beginPath();
      ctx.moveTo(xt, yt);
      ctx.lineTo(xb, yb);
      ctx.stroke();
    }
  }

  // Small gold modules bolted near the center of a plate (canisters, boxes).
  function drawModules(cx, cy, r, seed, alpha) {
    var count = 3;
    for (var i = 0; i < count; i++) {
      var ang = rand(seed + i) * Math.PI * 2;
      var dist = r * (0.2 + rand(seed + i * 2.2) * 0.4);
      var mx = cx + Math.cos(ang) * dist;
      var my = cy + Math.sin(ang) * dist * TILT;
      var mw = r * (0.09 + rand(seed + i * 3.1) * 0.06);
      var mh = r * (0.16 + rand(seed + i * 4.3) * 0.14);
      var g = ctx.createLinearGradient(mx - mw, 0, mx + mw, 0);
      g.addColorStop(0, rgba(GOLD.deep, alpha));
      g.addColorStop(0.45, rgba(GOLD.bright, alpha));
      g.addColorStop(0.6, rgba(GOLD.mid, alpha));
      g.addColorStop(1, rgba(GOLD.deep, alpha));
      ctx.fillStyle = g;
      ctx.fillRect(mx - mw, my - mh, mw * 2, mh);
      // cap
      ctx.fillStyle = rgba(GOLD.hi, alpha * 0.9);
      ctx.beginPath();
      ctx.ellipse(mx, my - mh, mw, mw * TILT, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function render() {
    var p = currentProgress;

    // Deep near-black backdrop, matching the site's base so the machine
    // reads as warm metal floating in the dark.
    ctx.fillStyle = "#020204";
    ctx.fillRect(0, 0, W, H);

    var sway = t * 1.4;
    var cx = W / 2 + Math.sin(t * 0.1) * W * 0.008;
    var zoom = 1 + p * 0.2;
    var baseR = Math.min(W, H) * 0.185 * zoom;

    var baseGap = H * 0.085;
    var extraGap = H * 0.185;
    var gap = baseGap + p * extraGap;

    var n = STAGES.length;
    var positions = [];
    var totalH = (n - 1) * gap;
    var startY = H * 0.46 - totalH / 2;
    for (var i = 0; i < n; i++) positions.push(startY + i * gap);

    var radii = STAGES.map(function (s) { return s.rFrac * baseR; });
    var thicks = STAGES.map(function (s) { return s.thick * baseR; });

    // Central column running down the middle of the stack.
    var colGrad = ctx.createLinearGradient(cx - 3 * DPR, 0, cx + 4 * DPR, 0);
    colGrad.addColorStop(0, rgba(GOLD.deep, 0.5));
    colGrad.addColorStop(0.5, rgba(GOLD.bright, 0.7));
    colGrad.addColorStop(1, rgba(GOLD.deep, 0.5));
    ctx.strokeStyle = colGrad;
    ctx.lineWidth = 3 * DPR;
    ctx.beginPath();
    ctx.moveTo(cx, positions[0]);
    ctx.lineTo(cx, positions[n - 1] + gap * 0.5);
    ctx.stroke();

    // Perimeter rods span the full height, behind everything.
    drawRods(cx, positions[0] + thicks[0], radii[0] * 0.9, positions[n - 1], radii[n - 1], 0.5 + p * 0.2);

    // Wire looms between consecutive stages (drawn before the plates so the
    // plates cleanly overlap the tops of the bundles).
    for (i = 0; i < n - 1; i++) {
      drawWires(
        cx,
        positions[i] + thicks[i], radii[i] * 0.9,
        positions[i + 1], radii[i + 1] * 0.94,
        sway + i, 0.5 + p * 0.15
      );
    }

    // Plates, top → bottom (painter's order = correct occlusion).
    for (i = 0; i < n; i++) {
      var s = STAGES[i];
      var alpha = 0.9;
      drawDisk(cx, positions[i], radii[i], thicks[i], s.metal, alpha);
      if (s.flange) {
        flangeRings(cx, positions[i], radii[i], alpha);
      } else if (i > 0 && i < n - 1) {
        drawModules(cx, positions[i], radii[i], i * 11.3, alpha * 0.95);
      }
    }

    // Mixing-chamber can + the qubit package glowing beneath the last stage.
    var lastY = positions[n - 1];
    var chamberR = radii[n - 1] * 0.5;
    drawDisk(cx, lastY + gap * 0.4, chamberR, chamberR * 0.5, GOLD, 0.9);
    var chipY = lastY + gap * 0.4 + chamberR * 0.7;
    var chipR = (5 + Math.sin(t * 1.6) * 1) * DPR;
    var glow = ctx.createRadialGradient(cx, chipY, 0, cx, chipY, chipR * 7);
    glow.addColorStop(0, "rgba(210,220,255,0.9)");
    glow.addColorStop(0.35, "rgba(150,140,235,0.4)");
    glow.addColorStop(1, "rgba(100,120,230,0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(cx, chipY, chipR * 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#eef0ff";
    ctx.beginPath();
    ctx.arc(cx, chipY, chipR, 0, Math.PI * 2);
    ctx.fill();

    // Legibility veil: darken the top band (where hero text sits) and the
    // very bottom, leaving the machine's midsection at full brightness.
    var veil = ctx.createLinearGradient(0, 0, 0, H);
    veil.addColorStop(0.0, "rgba(2,2,4,0.62)");
    veil.addColorStop(0.4, "rgba(2,2,4,0.12)");
    veil.addColorStop(0.72, "rgba(2,2,4,0.12)");
    veil.addColorStop(1.0, "rgba(2,2,4,0.5)");
    ctx.fillStyle = veil;
    ctx.fillRect(0, 0, W, H);
  }

  function animate() {
    currentProgress += (targetProgress - currentProgress) * 0.07;
    t += 0.01;
    render();
    requestAnimationFrame(animate);
  }

  window.addEventListener("resize", resize, { passive: true });
  resize();
  targetProgress = currentProgress = scrollProgress();
  render();

  if (reduceMotion) {
    // No autoplaying loop — redraw only in response to the user's own
    // scrolling or a viewport resize.
    window.addEventListener(
      "scroll",
      function () {
        currentProgress = scrollProgress();
        render();
      },
      { passive: true }
    );
    window.addEventListener("resize", render, { passive: true });
  } else {
    var scrollTicking = false;
    window.addEventListener(
      "scroll",
      function () {
        if (scrollTicking) return;
        scrollTicking = true;
        requestAnimationFrame(function () {
          targetProgress = scrollProgress();
          scrollTicking = false;
        });
      },
      { passive: true }
    );
    requestAnimationFrame(animate);
  }
})();
