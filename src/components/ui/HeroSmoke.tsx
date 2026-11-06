"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

type Wisp = {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  wobble: number;
  phase: number;
  alpha: number;
};

/** Thin cigarette-like smoke: sharp burst, then stops. Light, not foggy. */
export function HeroSmoke() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let raf = 0;
    let running = true;
    const wisps: Wisp[] = [];
    const start = performance.now();
    const BURST_UNTIL = 900;
    const STOP_SPAWN = 1400;
    const END = 3200;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const w = parent.clientWidth;
      const h = parent.clientHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const spawn = (n: number, sharp: boolean) => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      for (let i = 0; i < n; i++) {
        wisps.push({
          x: w * (0.28 + Math.random() * 0.44),
          y: h * (0.72 + Math.random() * 0.22),
          r: sharp ? 6 + Math.random() * 10 : 5 + Math.random() * 8,
          vx: (Math.random() - 0.5) * (sharp ? 0.55 : 0.25),
          vy: -(1.1 + Math.random() * (sharp ? 1.8 : 1.1)),
          life: 0,
          max: 55 + Math.random() * 45,
          wobble: 0.35 + Math.random() * 0.55,
          phase: Math.random() * Math.PI * 2,
          alpha: sharp ? 0.28 + Math.random() * 0.18 : 0.16 + Math.random() * 0.12,
        });
      }
    };

    resize();
    spawn(28, true);

    const onResize = () => resize();
    window.addEventListener("resize", onResize);

    const tick = (now: number) => {
      if (!running) return;
      const elapsed = now - start;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);

      if (elapsed < BURST_UNTIL) spawn(4, true);
      else if (elapsed < STOP_SPAWN && Math.random() > 0.55) spawn(1, false);

      for (let i = wisps.length - 1; i >= 0; i--) {
        const p = wisps[i];
        p.life += 1;
        p.phase += 0.08;
        p.x += p.vx + Math.sin(p.phase) * p.wobble * 0.35;
        p.y += p.vy;
        p.r += 0.12;
        p.vy *= 0.992;
        const t = p.life / p.max;
        if (t >= 1 || p.y < -40) {
          wisps.splice(i, 1);
          continue;
        }
        const fade = t < 0.12 ? t / 0.12 : Math.max(0, 1 - (t - 0.12) / 0.88);
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
        g.addColorStop(0, `rgba(245, 242, 235, ${p.alpha * fade})`);
        g.addColorStop(0.45, `rgba(200, 196, 188, ${p.alpha * 0.35 * fade})`);
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.beginPath();
        ctx.fillStyle = g;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      if (elapsed < END || wisps.length > 0) {
        raf = requestAnimationFrame(tick);
      } else {
        ctx.clearRect(0, 0, w, h);
      }
    };

    raf = requestAnimationFrame(tick);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, [reduce]);

  if (reduce) return null;

  return (
    <div className="hero-smoke" aria-hidden>
      <canvas ref={canvasRef} className="hero-smoke__canvas" />
    </div>
  );
}
