/* =========================================================
   Quantum Development Club @ FAU — site behavior
   - Mobile nav toggle
   - Scroll-reveal animations
   - Quantum lattice canvas background (particles + entangling links)
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

  /* ---------- Quantum lattice background ---------- */
  var canvas = document.getElementById("qc-bg");
  if (!canvas || !canvas.getContext) return;

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var ctx = canvas.getContext("2d");
  var W, H, DPR;
  var nodes = [];
  var NODE_COUNT = 70;
  var LINK_DIST = 150;
  var mouse = { x: null, y: null };

  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.width = window.innerWidth * DPR;
    H = canvas.height = window.innerHeight * DPR;
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";
    var area = window.innerWidth * window.innerHeight;
    NODE_COUNT = Math.max(28, Math.min(90, Math.round(area / 16000)));
    initNodes();
  }

  function initNodes() {
    nodes = [];
    for (var i = 0; i < NODE_COUNT; i++) {
      nodes.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.25 * DPR,
        vy: (Math.random() - 0.5) * 0.25 * DPR,
        r: (Math.random() * 1.4 + 0.6) * DPR,
        pulse: Math.random() * Math.PI * 2
      });
    }
  }

  function step() {
    ctx.clearRect(0, 0, W, H);

    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      n.x += n.vx;
      n.y += n.vy;
      n.pulse += 0.02;

      if (n.x < 0 || n.x > W) n.vx *= -1;
      if (n.y < 0 || n.y > H) n.vy *= -1;

      for (var j = i + 1; j < nodes.length; j++) {
        var o = nodes[j];
        var dx = n.x - o.x, dy = n.y - o.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        var maxDist = LINK_DIST * DPR;
        if (dist < maxDist) {
          var alpha = (1 - dist / maxDist) * 0.35;
          var grad = ctx.createLinearGradient(n.x, n.y, o.x, o.y);
          grad.addColorStop(0, "rgba(94,92,230," + alpha + ")");
          grad.addColorStop(1, "rgba(100,210,255," + alpha + ")");
          ctx.strokeStyle = grad;
          ctx.lineWidth = 1 * DPR;
          ctx.beginPath();
          ctx.moveTo(n.x, n.y);
          ctx.lineTo(o.x, o.y);
          ctx.stroke();
        }
      }
    }

    for (var k = 0; k < nodes.length; k++) {
      var p = nodes[k];
      var glow = (Math.sin(p.pulse) + 1) / 2;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * (1 + glow * 0.6), 0, Math.PI * 2);
      ctx.fillStyle = "rgba(180,190,255," + (0.55 + glow * 0.35) + ")";
      ctx.fill();
    }

    if (!reduceMotion) requestAnimationFrame(step);
  }

  window.addEventListener("resize", resize, { passive: true });
  resize();
  step();
})();
