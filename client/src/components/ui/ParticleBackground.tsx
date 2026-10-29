import React, { useEffect, useRef } from 'react';

interface ParticleBackgroundProps {
  colors?: string[];
  density?: number;
  radius?: number;
  push?: number;
  parallax?: number;
  ease?: number;
  style?: React.CSSProperties;
}

interface Particle {
  hx: number;
  hy: number;
  x: number;
  y: number;
  depth: number;
  len: number;
  thick: number;
  angle: number;
  targetAngle: number;
  color: string;
  alpha: number;
  phase: number;
}

export const ParticleBackground: React.FC<ParticleBackgroundProps> = ({
  colors = ['#ea4335', '#4285f4', '#fbbc04', '#8e5bd0', '#f9722c', '#3b5bdb'],
  density = 3200,
  radius = 220,
  push = 70,
  parallax = 18,
  ease = 0.08,
  style
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let w = window.innerWidth;
    let h = window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let particles: Particle[] = [];
    let animationFrameId: number;

    const mouse = { x: -9999, y: -9999, nx: 0, ny: 0 };
    const smooth = { x: 0, y: 0 };

    function resize() {
      if (!canvas || !ctx) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.floor((w * h) / density);
      particles = Array.from({ length: count }, () => {
        const depth = 0.4 + Math.random() * 0.9;
        const hx = Math.random() * w;
        const hy = Math.random() * h;
        return {
          hx,
          hy,
          x: hx,
          y: hy,
          depth,
          len: 3 + Math.random() * 5 * depth,
          thick: 1.2 + Math.random() * 1.4 * depth,
          angle: Math.random() * Math.PI,
          targetAngle: 0,
          color: colors[(Math.random() * colors.length) | 0],
          alpha: 0.35 + Math.random() * 0.65,
          phase: Math.random() * Math.PI * 2
        };
      });
    }

    function onMove(e: PointerEvent) {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.nx = (e.clientX / w - 0.5) * 2;
      mouse.ny = (e.clientY / h - 0.5) * 2;
    }

    function onLeave() {
      mouse.x = -9999;
      mouse.y = -9999;
      mouse.nx = 0;
      mouse.ny = 0;
    }

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onMove, { passive: true });
    document.addEventListener('pointerleave', onLeave);
    window.addEventListener('resize', resize);

    resize();

    function frame(t: number) {
      if (!ctx) return;
      ctx.clearRect(0, 0, w, h);
      smooth.x += (mouse.nx - smooth.x) * 0.05;
      smooth.y += (mouse.ny - smooth.y) * 0.05;

      for (const p of particles) {
        const fx = reduceMotion ? 0 : Math.sin(t * 0.0006 + p.phase) * 4 * p.depth;
        const fy = reduceMotion ? 0 : Math.cos(t * 0.0005 + p.phase) * 4 * p.depth;

        let tx = p.hx + fx - smooth.x * parallax * p.depth;
        let ty = p.hy + fy - smooth.y * parallax * p.depth;

        const dx = tx - mouse.x;
        const dy = ty - mouse.y;
        const dist = Math.hypot(dx, dy);

        if (dist < radius) {
          const f = 1 - dist / radius;
          const k = f * f * push * p.depth;
          tx += (dx / (dist || 1)) * k;
          ty += (dy / (dist || 1)) * k;
          p.targetAngle = Math.atan2(dy, dx);
        } else {
          p.targetAngle = p.angle;
        }

        p.x += (tx - p.x) * ease;
        p.y += (ty - p.y) * ease;
        let da = p.targetAngle - p.angle;
        da = Math.atan2(Math.sin(da), Math.cos(da));
        p.angle += da * 0.12;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.globalAlpha = p.alpha;
        ctx.strokeStyle = p.color;
        ctx.lineWidth = p.thick;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(-p.len / 2, 0);
        ctx.lineTo(p.len / 2, 0);
        ctx.stroke();
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(frame);
    }

    animationFrameId = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onMove);
      document.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('resize', resize);
    };
  }, [colors, density, radius, push, parallax, ease]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
        ...style
      }}
    />
  );
};
