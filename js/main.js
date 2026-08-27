/* =========================================================
   Quantum Development Club @ FAU — site behavior
   - Mobile nav toggle
   - Scroll-reveal animations
   - Rotating 3D quantum atom visual (hero centerpiece)
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

  /* ---------- Hero visual parallax (subtle Apple-style scale/fade) ---------- */
  var heroVisual = document.querySelector(".hero-visual");
  if (heroVisual && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var ticking = false;
    window.addEventListener(
      "scroll",
      function () {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(function () {
          var rect = heroVisual.getBoundingClientRect();
          var vh = window.innerHeight;
          var progress = Math.min(Math.max((vh - rect.top) / (vh * 1.1), 0), 1);
          var scale = 1 - progress * 0.06;
          var opacity = 1 - progress * 0.35;
          heroVisual.style.transform = "scale(" + scale + ")";
          heroVisual.style.opacity = opacity;
          ticking = false;
        });
      },
      { passive: true }
    );
  }

  /* ---------- Rotating 3D quantum atom visual ---------- */
  var canvas = document.getElementById("qc-bg");
  if (!canvas || !canvas.getContext) return;

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var ctx = canvas.getContext("2d");
  var W, H, DPR, CX, CY, FOCAL, SCALE;
  var t = 0;

  // Three orbit rings, tilted at different angles, each carrying points
  // that trace the ring as it rotates in 3D — a stylized quantum atom.
  var RINGS = [
    { tiltX: 0.55, tiltZ: 0.0, color: [94, 92, 230], speed: 1.0 },
    { tiltX: -0.45, tiltZ: 2.05, color: [100, 210, 255], speed: 0.8 },
    { tiltX: 0.25, tiltZ: -2.05, color: [191, 90, 242], speed: 1.25 }
  ];
  var POINTS_PER_RING = 64;
  var RING_R = 1;

  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    var box = canvas.parentElement.getBoundingClientRect();
    var cw = box.width || window.innerWidth;
    var ch = box.height || window.innerHeight * 0.5;
    W = canvas.width = cw * DPR;
    H = canvas.height = ch * DPR;
    canvas.style.width = cw + "px";
    canvas.style.height = ch + "px";
    CX = W / 2;
    CY = H / 2;
    SCALE = Math.min(W, H) * 0.34;
    FOCAL = Math.min(W, H) * 1.15;
  }

  // Rotate a unit-sphere point by the ring's fixed tilt, then by the
  // scene's animated yaw/pitch, and perspective-project to 2D.
  function project(x, y, z, yaw, pitch) {
    // yaw (around Y axis)
    var cosY = Math.cos(yaw), sinY = Math.sin(yaw);
    var x1 = x * cosY + z * sinY;
    var z1 = -x * sinY + z * cosY;
    // pitch (around X axis)
    var cosP = Math.cos(pitch), sinP = Math.sin(pitch);
    var y2 = y * cosP - z1 * sinP;
    var z2 = y * sinP + z1 * cosP;

    var scale = FOCAL / (FOCAL + z2 * SCALE);
    return {
      x: CX + x1 * SCALE * scale,
      y: CY + y2 * SCALE * scale,
      scale: scale,
      z: z2
    };
  }

  function ringPoint(ring, angle) {
    // Point on a unit circle in the ring's own tilted plane
    var x = Math.cos(angle) * RING_R;
    var y = Math.sin(angle) * RING_R;
    var z = 0;
    // tilt around X
    var cosX = Math.cos(ring.tiltX), sinX = Math.sin(ring.tiltX);
    var y1 = y * cosX - z * sinX;
    var z1 = y * sinX + z * cosX;
    // tilt around Z
    var cosZ = Math.cos(ring.tiltZ), sinZ = Math.sin(ring.tiltZ);
    var x2 = x * cosZ - y1 * sinZ;
    var y2 = x * sinZ + y1 * cosZ;
    return { x: x2, y: y2, z: z1 };
  }

  function step() {
    ctx.clearRect(0, 0, W, H);

    var yaw = t * 0.25;
    var pitch = 0.18 + Math.sin(t * 0.15) * 0.12;

    RINGS.forEach(function (ring) {
      var pts = [];
      for (var i = 0; i <= POINTS_PER_RING; i++) {
        var angle = (i / POINTS_PER_RING) * Math.PI * 2 + t * ring.speed * 0.35;
        var p = ringPoint(ring, angle);
        pts.push(project(p.x, p.y, p.z, yaw, pitch));
      }

      // Draw the ring path, segment opacity/width driven by depth (z)
      for (var s = 0; s < pts.length - 1; s++) {
        var a = pts[s], b = pts[s + 1];
        var depth = (a.scale - 0.7) / 0.6; // ~0 (far) to ~1 (near)
        depth = Math.max(0.08, Math.min(1, depth));
        ctx.strokeStyle = "rgba(" + ring.color[0] + "," + ring.color[1] + "," + ring.color[2] + "," + (depth * 0.85) + ")";
        ctx.lineWidth = (0.6 + depth * 1.8) * DPR;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }

      // A bright traveling node riding each ring
      var headAngle = t * ring.speed * 0.35;
      var hp = ringPoint(ring, headAngle);
      var proj = project(hp.x, hp.y, hp.z, yaw, pitch);
      var headDepth = Math.max(0.25, Math.min(1, (proj.scale - 0.7) / 0.6));
      var r = (2.6 + headDepth * 2.6) * DPR;
      var glowGrad = ctx.createRadialGradient(proj.x, proj.y, 0, proj.x, proj.y, r * 4);
      glowGrad.addColorStop(0, "rgba(" + ring.color[0] + "," + ring.color[1] + "," + ring.color[2] + "," + (0.9 * headDepth) + ")");
      glowGrad.addColorStop(1, "rgba(" + ring.color[0] + "," + ring.color[1] + "," + ring.color[2] + ",0)");
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(proj.x, proj.y, r * 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255," + (0.85 * headDepth + 0.15) + ")";
      ctx.beginPath();
      ctx.arc(proj.x, proj.y, r, 0, Math.PI * 2);
      ctx.fill();
    });

    // Glowing nucleus at the center
    var nucleusR = 7 * DPR + Math.sin(t * 1.6) * 1.2 * DPR;
    var nucleusGrad = ctx.createRadialGradient(CX, CY, 0, CX, CY, nucleusR * 5);
    nucleusGrad.addColorStop(0, "rgba(210,215,255,0.95)");
    nucleusGrad.addColorStop(0.35, "rgba(120,120,235,0.5)");
    nucleusGrad.addColorStop(1, "rgba(100,110,230,0)");
    ctx.fillStyle = nucleusGrad;
    ctx.beginPath();
    ctx.arc(CX, CY, nucleusR * 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#f5f5ff";
    ctx.beginPath();
    ctx.arc(CX, CY, nucleusR, 0, Math.PI * 2);
    ctx.fill();

    t += 0.012;
    if (!reduceMotion) requestAnimationFrame(step);
  }

  window.addEventListener("resize", resize, { passive: true });
  resize();
  step();
})();
