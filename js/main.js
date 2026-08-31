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
     behind every section. The whole image stays intact — never sliced.
     Scrolling drives a slow zoom plus a gentle downward pan, so it feels like
     you're descending into the cryostat toward the qubit chip at the bottom:
     cinematic, always photo-real, no seams.
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
      // Whole machine, never sliced. A slow zoom-in plus a gentle downward
      // pan makes it feel like you're descending into the cryostat toward the
      // qubit chip as you scroll — smooth and cinematic, no seams.
      var idle = 1 + Math.sin(t * 0.5) * 0.006;            // faint breathing
      var scale = (1 + p * 0.26) * idle;
      var containH = Math.min(H * 0.985, (W * 0.985) / IMG_AR);
      var drawH = containH * scale;
      var drawW = drawH * IMG_AR;
      var x = (W - drawW) / 2 + Math.sin(t * 0.3) * W * 0.003; // faint drift
      var y = (H - drawH) / 2 - p * H * 0.16;               // pan toward chip
      ctx.drawImage(img, x, y, drawW, drawH);
    }

    // Legibility veil: darken the top band (hero text) and the very bottom,
    // leaving the machine's midsection at full brightness.
    var veil = ctx.createLinearGradient(0, 0, 0, H);
    veil.addColorStop(0.0, "rgba(0,0,0,0.78)");
    veil.addColorStop(0.34, "rgba(0,0,0,0.6)");
    veil.addColorStop(0.62, "rgba(0,0,0,0.42)");
    veil.addColorStop(1.0, "rgba(0,0,0,0.58)");
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
