// particle-bg.js — pointer-reactive confetti background
// Usage: <script src="particle-bg.js"></script>  (canvas apne aap ban jata hai)
(() => {
  const canvas = document.createElement("canvas");
  Object.assign(canvas.style, {
    position: "fixed", inset: "0", width: "100%", height: "100%",
    zIndex: "0", pointerEvents: "none",
  });
  document.body.prepend(canvas);
  const ctx = canvas.getContext("2d");
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---- tweak these ----
  const COLORS = ["#ea4335", "#4285f4", "#fbbc04", "#8e5bd0", "#f9722c", "#3b5bdb"];
  const DENSITY = 3200;   // chhota = zyada particles (pehle 9000 tha)
  const RADIUS = 220;     // pointer influence radius (px)
  const PUSH = 70;        // kitna dhakelna hai
  const PARALLAX = 18;    // pointer ke saath poore field ka drift
  const EASE = 0.08;      // smoothing
  // ---------------------

  let w, h, dpr, particles = [];
  const mouse = { x: -9999, y: -9999, nx: 0, ny: 0 };
  const smooth = { x: 0, y: 0 };

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = innerWidth; h = innerHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.floor((w * h) / DENSITY);
    particles = Array.from({ length: count }, () => {
      const depth = 0.4 + Math.random() * 0.9;
      const hx = Math.random() * w, hy = Math.random() * h;
      return {
        hx, hy, x: hx, y: hy, depth,
        len: 3 + Math.random() * 5 * depth,
        thick: 1.2 + Math.random() * 1.4 * depth,
        angle: Math.random() * Math.PI, targetAngle: 0,
        color: COLORS[(Math.random() * COLORS.length) | 0],
        alpha: 0.35 + Math.random() * 0.65,
        phase: Math.random() * Math.PI * 2,
      };
    });
  }

  function onMove(e) {
    mouse.x = e.clientX; mouse.y = e.clientY;
    mouse.nx = (e.clientX / w - 0.5) * 2;
    mouse.ny = (e.clientY / h - 0.5) * 2;
  }
  addEventListener("pointermove", onMove, { passive: true });
  addEventListener("pointerdown", onMove, { passive: true });
  document.addEventListener("pointerleave", () => {
    mouse.x = mouse.y = -9999; mouse.nx = mouse.ny = 0;
  });
  addEventListener("resize", resize);

  function frame(t) {
    ctx.clearRect(0, 0, w, h);
    smooth.x += (mouse.nx - smooth.x) * 0.05;
    smooth.y += (mouse.ny - smooth.y) * 0.05;

    for (const p of particles) {
      const fx = reduceMotion ? 0 : Math.sin(t * 0.0006 + p.phase) * 4 * p.depth;
      const fy = reduceMotion ? 0 : Math.cos(t * 0.0005 + p.phase) * 4 * p.depth;

      let tx = p.hx + fx - smooth.x * PARALLAX * p.depth;
      let ty = p.hy + fy - smooth.y * PARALLAX * p.depth;

      const dx = tx - mouse.x, dy = ty - mouse.y;
      const dist = Math.hypot(dx, dy);
      if (dist < RADIUS) {
        const f = 1 - dist / RADIUS;
        const k = f * f * PUSH * p.depth;
        tx += (dx / (dist || 1)) * k;
        ty += (dy / (dist || 1)) * k;
        p.targetAngle = Math.atan2(dy, dx);
      } else {
        p.targetAngle = p.angle;
      }

      p.x += (tx - p.x) * EASE;
      p.y += (ty - p.y) * EASE;
      let da = p.targetAngle - p.angle;
      da = Math.atan2(Math.sin(da), Math.cos(da));
      p.angle += da * 0.12;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      ctx.globalAlpha = p.alpha;
      ctx.strokeStyle = p.color;
      ctx.lineWidth = p.thick;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(-p.len / 2, 0);
      ctx.lineTo(p.len / 2, 0);
      ctx.stroke();
      ctx.restore();
    }
    requestAnimationFrame(frame);
  }

  resize();
  requestAnimationFrame(frame);
})();
