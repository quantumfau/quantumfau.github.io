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

     A real photographic render of a dilution-refrigerator quantum computer
     (freely-licensed, via Wikimedia Commons) is drawn full-viewport, pinned
     behind every section. The image is cut into horizontal segments along
     the natural gaps between its cooling plates; scrolling the page — in
     either direction — pulls those segments apart, so the machine appears to
     separate into its stacked levels the further you scroll. The plates
     themselves are never distorted, so the object stays photo-real.
     ================================================================ */
  var canvas = document.getElementById("qc-levels-bg");
  if (!canvas || !canvas.getContext) return;

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var ctx = canvas.getContext("2d");
  var W, H, DPR;
  var t = 0;
  var targetProgress = 0;
  var currentProgress = 0;

  var img = new Image();
  var imgReady = false;
  img.onload = function () { imgReady = true; render(); };
  img.src = "assets/img/quantum-computer.webp";
  var IMG_AR = 960 / 1920; // native aspect (w/h)

  // Cut lines (fractions of image height), chosen to fall in the dark gaps
  // just above each cooling plate, so every segment carries a plate plus the
  // wires hanging beneath it. Pulling a segment down lets those wires dangle
  // into the opening — reading as the stack stretching apart.
  var SEAMS = [0, 0.25, 0.40, 0.52, 0.61, 1];

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

  function render() {
    // Pure-black backdrop — matches the site so the machine and the gaps that
    // open between its plates sit in the same seamless dark.
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, W, H);

    if (imgReady) {
      var p = currentProgress;
      var zoom = 1 + p * 0.12;

      // "Contain" the image in the viewport (fit by height, but never wider
      // than the screen), then apply the scroll zoom.
      var baseH = Math.min(H * 0.96, (W * 0.96) / IMG_AR) * zoom;
      var drawW = baseH * IMG_AR;
      var x = (W - drawW) / 2 + Math.sin(t * 0.4) * W * 0.004; // faint drift

      var gap = p * H * 0.11;                 // per-seam separation
      var nSeg = SEAMS.length - 1;
      var totalH = baseH + gap * (nSeg - 1);
      var cursorY = (H - totalH) / 2 - H * 0.02;

      for (var i = 0; i < nSeg; i++) {
        var s0 = SEAMS[i], s1 = SEAMS[i + 1];
        var srcY = s0 * 1920;
        var srcH = (s1 - s0) * 1920;
        var dH = (s1 - s0) * baseH;
        ctx.drawImage(img, 0, srcY, 960, srcH, x, cursorY, drawW, dH);
        cursorY += dH + gap;
      }
    }

    // Legibility veil: darken the top band (hero text) and the very bottom,
    // leaving the machine's midsection at full brightness.
    var veil = ctx.createLinearGradient(0, 0, 0, H);
    veil.addColorStop(0.0, "rgba(0,0,0,0.66)");
    veil.addColorStop(0.34, "rgba(0,0,0,0.14)");
    veil.addColorStop(0.72, "rgba(0,0,0,0.12)");
    veil.addColorStop(1.0, "rgba(0,0,0,0.5)");
    ctx.fillStyle = veil;
    ctx.fillRect(0, 0, W, H);
  }

  function animate() {
    currentProgress += (targetProgress - currentProgress) * 0.08;
    t += 0.01;
    render();
    requestAnimationFrame(animate);
  }

  window.addEventListener("resize", function () { resize(); render(); }, { passive: true });
  resize();
  targetProgress = currentProgress = scrollProgress();
  render();

  if (reduceMotion) {
    // No autoplaying loop — redraw only in response to the user's own
    // scrolling (which still separates the levels) or a viewport resize.
    window.addEventListener(
      "scroll",
      function () {
        currentProgress = scrollProgress();
        render();
      },
      { passive: true }
    );
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
