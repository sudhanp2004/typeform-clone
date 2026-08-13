"use client";

import { useEffect, useRef } from "react";

const COLORS = [
  "#FF6B6B", "#FF8E53", "#FFC84A", "#4CAF50",
  "#2196F3", "#9C27B0", "#FF4081", "#00BCD4",
  "#FFEB3B", "#8BC34A", "#FF5722", "#3F51B5",
];

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  gravity: number;
  drag: number;
}

function spawn(canvas: HTMLCanvasElement): Particle {
  // Origin: top-right area near the publish button
  const originX = canvas.width * 0.82;
  const originY = canvas.height * 0.06;
  const angle = Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.6;
  const speed = 8 + Math.random() * 18;
  return {
    x: originX + (Math.random() - 0.5) * 80,
    y: originY,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    w: 6 + Math.random() * 10,
    h: 3 + Math.random() * 6,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    rotation: Math.random() * Math.PI * 2,
    rotationSpeed: (Math.random() - 0.5) * 0.3,
    opacity: 1,
    gravity: 0.4 + Math.random() * 0.3,
    drag: 0.982 + Math.random() * 0.012,
  };
}

export function usePublishConfetti(active: boolean) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let particles: Particle[] = Array.from({ length: 120 }, () => spawn(canvas));
    let elapsed = 0;
    let lastTime = performance.now();
    let raf: number;

    // Second burst at 350ms
    const burst2 = setTimeout(() => {
      if (!canvasRef.current) return;
      particles = [...particles, ...Array.from({ length: 80 }, () => spawn(canvasRef.current!))];
    }, 350);

    const tick = (now: number) => {
      const dt = Math.min((now - lastTime) / 16.67, 3);
      lastTime = now;
      elapsed += dt;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Faint white wash over builder during animation (fades in/out)
      const washOpacity = elapsed < 10 ? Math.min(elapsed / 5, 1) * 0.12 : Math.max(0, 0.12 - (elapsed - 10) / 20);
      if (washOpacity > 0) {
        ctx.fillStyle = `rgba(255,255,255,${washOpacity})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      for (const p of particles) {
        p.vy = (p.vy + p.gravity * dt) * p.drag;
        p.vx *= p.drag;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.rotation += p.rotationSpeed * dt;

        // Fade out when near bottom
        if (p.y > canvas.height * 0.7) {
          p.opacity = Math.max(0, p.opacity - 0.03 * dt);
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }

      particles = particles.filter((p) => p.opacity > 0.01 && p.y < canvas.height + 60);

      if (particles.length > 0) {
        raf = requestAnimationFrame(tick);
      }
    };

    raf = requestAnimationFrame(tick);

    const onResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(burst2);
      window.removeEventListener("resize", onResize);
    };
  }, [active]);

  return canvasRef;
}

export function PublishConfetti({ active, onDone }: { active: boolean; onDone?: () => void }) {
  const canvasRef = usePublishConfetti(active);

  // Auto-dismiss after 3s
  useEffect(() => {
    if (!active) return;
    const t = setTimeout(() => onDone?.(), 3000);
    return () => clearTimeout(t);
  }, [active, onDone]);

  if (!active) return null;
  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-50"
      aria-hidden
    />
  );
}
