"use client";

import React, {useEffect, useRef} from "react";

type Star = { x: number; y: number; z: number; size: number; speed: number; twinkle: number };
type Streak = { x: number; y: number; vx: number; vy: number; life: number; ttl: number; width: number };

export default function Starfield({ density = 1 }: Readonly<{ density?: number }>) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let width = 0, height = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
    let stars: Star[] = [];
    let streaks: Streak[] = [];
    let mouseX = 0, mouseY = 0; // for subtle parallax
    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const resize = () => {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      spawnStars();
    };

    const spawnStars = () => {
      const base = Math.floor((width * height) / 12000); // density baseline
      const count = Math.min(600, Math.max(80, Math.floor(base * density)));
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        z: Math.random() * 0.9 + 0.1,
        size: Math.random() * 1.1 + 0.2,
        speed: Math.random() * 0.15 + 0.05,
        twinkle: Math.random()
      }));
      // reset streaks on resize for simplicity
      streaks = [];
    };

    const spawnStreak = () => {
      if (reduceMotion) return;
      // originate near top-right quadrant, travel down-left
      const startX = width * (0.6 + Math.random() * 0.35);
      const startY = height * (Math.random() * 0.35);
      const speed = 4.2 + Math.random() * 2.2; // px/frame baseline
      const angle = (-135 + (Math.random() * 10 - 5)) * (Math.PI / 180); // around -135°
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      const ttl = 60 + Math.floor(Math.random() * 40); // frames
      const widthPx = 1 + Math.random() * 1.5;
      streaks.push({ x: startX, y: startY, vx, vy, life: 0, ttl, width: widthPx });
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      // Subtle vignette
      const grd = ctx.createRadialGradient(width/2, height*0.2, 0, width/2, height*0.2, Math.max(width, height));
      grd.addColorStop(0, "rgba(124,92,255,0.04)");
      grd.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, width, height);

      const offsetX = (mouseX - width/2) * 0.0008;
      const offsetY = (mouseY - height/2) * 0.0008;

      for (const s of stars) {
        const alpha = 0.35 + Math.sin((s.twinkle += 0.02)) * 0.15;
        const parX = s.x + offsetX * (1 / s.z) * 60;
        const parY = s.y + offsetY * (1 / s.z) * 60;
        ctx.beginPath();
        ctx.fillStyle = `rgba(230,235,255,${alpha})`;
        ctx.arc(parX, parY, s.size * (1 / s.z), 0, Math.PI * 2);
        ctx.fill();

        // drift downward very slowly for life
        s.y += s.speed * (1 / s.z);
        if (s.y > height + 4) {
          s.y = -4;
          s.x = Math.random() * width;
          s.z = Math.random() * 0.9 + 0.1;
        }
      }

      // Occasionally spawn a streak
      if (!reduceMotion && Math.random() < 0.02 && streaks.length < 2) {
        spawnStreak();
      }

      // Draw streaks (shooting stars)
      if (streaks.length) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        for (let i = streaks.length - 1; i >= 0; i--) {
          const st = streaks[i];
          st.life++;
          st.x += st.vx;
          st.y += st.vy;
          // fade in then out
          const p = st.life / st.ttl;
          const alpha = p < 0.2 ? p / 0.2 : (p > 0.8 ? (1 - p) / 0.2 : 1);
          const len = 22 + p * 28; // trail length
          const nx = st.x - (st.vx / Math.hypot(st.vx, st.vy)) * len;
          const ny = st.y - (st.vy / Math.hypot(st.vx, st.vy)) * len;
          const g = ctx.createLinearGradient(nx, ny, st.x, st.y);
          g.addColorStop(0, `rgba(124,92,255,0)`);
          g.addColorStop(0.6, `rgba(180,190,255,${0.25 * alpha})`);
          g.addColorStop(1, `rgba(255,255,255,${0.75 * alpha})`);
          ctx.strokeStyle = g;
          ctx.lineWidth = st.width;
          ctx.beginPath();
          ctx.moveTo(nx, ny);
          ctx.lineTo(st.x, st.y);
          ctx.stroke();

          if (st.life > st.ttl || st.x < -50 || st.y > height + 50) {
            streaks.splice(i, 1);
          }
        }
        ctx.restore();
      }
      rafRef.current = requestAnimationFrame(draw);
    };

    const onMouse = (e: MouseEvent) => { mouseX = e.clientX; mouseY = e.clientY; };
    // Only add mouse listener on non-touch devices
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (!isTouchDevice) {
      window.addEventListener("mousemove", onMouse);
    }
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();
    rafRef.current = requestAnimationFrame(draw);

    return () => {
      if (!isTouchDevice) {
        window.removeEventListener("mousemove", onMouse);
      }
      ro.disconnect();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [density]);

  return <canvas ref={canvasRef} className="starfield-canvas" aria-hidden />;
}
