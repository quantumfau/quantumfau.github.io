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

  /* ---------- Full-page quantum-computer background (home only) ----------
     A stylized cryostat: stacked disks ("levels") joined by looms of thin
     wires, drawn full-viewport and pinned behind every section. Scrolling
     the page — in either direction — drives how far the levels have
     separated, as if the machine is opening up the further you scroll. */
  var canvas = document.getElementById("qc-levels-bg");
  if (!canvas || !canvas.getContext) return;

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var ctx = canvas.getContext("2d");
  var W, H, DPR;
  var t = 0;
  var targetProgress = 0;
  var currentProgress = 0;

  var LEVELS = [
    { r: 1.0, color: [214, 219, 230] },   // top plate — cool silver
    { r: 0.8, color: [148, 150, 220] },   // indigo drifting in
    { r: 0.62, color: [94, 92, 230] },    // accent-indigo
    { r: 0.46, color: [100, 210, 255] },  // accent-cyan
    { r: 0.32, color: [191, 90, 242] }    // accent-purple, nearest the chip
  ];
  var WIRES_PER_GAP = 12;

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

  function drawLevel(cx, cy, radiusPx, tiltY, color, alpha, glow) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(1, tiltY);
    if (glow) {
      var g = ctx.createRadialGradient(0, 0, radiusPx * 0.2, 0, 0, radiusPx * 1.4);
      g.addColorStop(0, "rgba(" + color[0] + "," + color[1] + "," + color[2] + "," + (alpha * 0.35) + ")");
      g.addColorStop(1, "rgba(" + color[0] + "," + color[1] + "," + color[2] + ",0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(0, 0, radiusPx * 1.4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.strokeStyle = "rgba(" + color[0] + "," + color[1] + "," + color[2] + "," + alpha + ")";
    ctx.lineWidth = 1.6 * DPR;
    ctx.beginPath();
    ctx.arc(0, 0, radiusPx, 0, Math.PI * 2);
    ctx.stroke();
    // Rim highlight
    ctx.strokeStyle = "rgba(255,255,255," + (alpha * 0.4) + ")";
    ctx.lineWidth = 0.6 * DPR;
    ctx.beginPath();
    ctx.arc(0, 0, radiusPx * 0.985, Math.PI * 1.08, Math.PI * 1.9);
    ctx.stroke();
    ctx.restore();
  }

  function drawWires(cx, y1, r1, y2, r2, tiltY, color, alpha, sway) {
    for (var i = 0; i < WIRES_PER_GAP; i++) {
      var angle = (i / WIRES_PER_GAP) * Math.PI * 2;
      var wobble = Math.sin(angle * 3 + sway) * 0.06 + 1;
      var x1 = cx + Math.cos(angle) * r1;
      var yy1 = y1 + Math.sin(angle) * r1 * tiltY;
      var x2 = cx + Math.cos(angle) * r2;
      var yy2 = y2 + Math.sin(angle) * r2 * tiltY;
      var bowX = cx + Math.cos(angle) * ((r1 + r2) / 2) * 1.16 * wobble;
      var midY = (yy1 + yy2) / 2;
      ctx.strokeStyle = "rgba(" + color[0] + "," + color[1] + "," + color[2] + "," + alpha + ")";
      ctx.lineWidth = 0.55 * DPR;
      ctx.beginPath();
      ctx.moveTo(x1, yy1);
      ctx.bezierCurveTo(bowX, yy1 + (midY - yy1) * 0.6, bowX, yy2 - (yy2 - midY) * 0.6, x2, yy2);
      ctx.stroke();
    }
  }

  function render() {
    var p = currentProgress;

    // Dim near-black backdrop — matches the site's base black, so the
    // machine reads as glowing metal against dark rather than a bright box.
    ctx.fillStyle = "#020204";
    ctx.fillRect(0, 0, W, H);

    var cx = W / 2 + Math.sin(t * 0.12) * W * 0.01;
    var tiltY = 0.32;
    var zoom = 1 + p * 0.22;
    var baseR = Math.min(W, H) * 0.2 * zoom;
    var baseGap = H * 0.075;
    var extraGap = H * 0.2;
    var gap = baseGap + p * extraGap;
    var n = LEVELS.length;
    var totalHeight = (n - 1) * gap;
    var startY = H / 2 - totalHeight / 2 - H * 0.06;

    var positions = [];
    for (var i = 0; i < n; i++) {
      positions.push(startY + i * gap);
    }

    // Wire looms first, so the disks draw cleanly on top of them.
    for (i = 0; i < n - 1; i++) {
      var lvA = LEVELS[i], lvB = LEVELS[i + 1];
      drawWires(
        cx,
        positions[i], lvA.r * baseR,
        positions[i + 1], lvB.r * baseR,
        tiltY,
        [(lvA.color[0] + lvB.color[0]) / 2, (lvA.color[1] + lvB.color[1]) / 2, (lvA.color[2] + lvB.color[2]) / 2],
        0.16 + p * 0.1,
        t * 2 + i
      );
    }

    for (i = 0; i < n; i++) {
      var lv = LEVELS[i];
      drawLevel(cx, positions[i], lv.r * baseR, tiltY, lv.color, 0.55 + p * 0.15, i === n - 1);
    }

    // A small glowing chip beneath the last level — the "qubits" themselves.
    var chipY = positions[n - 1] + gap * 0.42;
    var chipR = (5 + Math.sin(t * 1.6) * 1) * DPR;
    var chipGrad = ctx.createRadialGradient(cx, chipY, 0, cx, chipY, chipR * 6);
    chipGrad.addColorStop(0, "rgba(210,215,255,0.9)");
    chipGrad.addColorStop(0.35, "rgba(150,120,235,0.45)");
    chipGrad.addColorStop(1, "rgba(100,110,230,0)");
    ctx.fillStyle = chipGrad;
    ctx.beginPath();
    ctx.arc(cx, chipY, chipR * 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#f5f5ff";
    ctx.beginPath();
    ctx.arc(cx, chipY, chipR, 0, Math.PI * 2);
    ctx.fill();
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
    // No autoplaying animation loop — redraw only in direct response to
    // the user's own scroll or a viewport resize.
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
