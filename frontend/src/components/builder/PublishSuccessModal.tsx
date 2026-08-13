"use client";

import { useEffect, useRef, useState } from "react";

// ---------------------------------------------------------------------------
// Confetti particle system — pure canvas, no library
// ---------------------------------------------------------------------------

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;           // radius
  color: string;
  rotation: number;
  rotationSpeed: number;
  shape: "rect" | "circle" | "ribbon";
  w: number;
  h: number;
  opacity: number;
  gravity: number;
  drag: number;
}

const COLORS = [
  "#FF6B6B", "#FFD93D", "#6BCB77", "#4D96FF",
  "#FF922B", "#CC5DE8", "#20C997", "#F06595",
  "#74C0FC", "#FFA94D", "#A9E34B", "#DA77F2",
];

function makeParticle(canvas: HTMLCanvasElement): Particle {
  const shape = Math.random() < 0.6 ? "rect" : Math.random() < 0.5 ? "circle" : "ribbon";
  const angle = (-Math.PI / 2) + (Math.random() - 0.5) * Math.PI * 1.4; // mostly upward fan
  const speed = 14 + Math.random() * 20;
  return {
    x: canvas.width / 2 + (Math.random() - 0.5) * canvas.width * 0.3,
    y: canvas.height * 0.6,
    vx: Math.cos(angle) * speed * (Math.random() * 0.6 + 0.4),
    vy: Math.sin(angle) * speed,
    r: 4 + Math.random() * 5,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    rotation: Math.random() * Math.PI * 2,
    rotationSpeed: (Math.random() - 0.5) * 0.25,
    shape,
    w: 6 + Math.random() * 10,
    h: shape === "ribbon" ? 2 + Math.random() * 3 : 6 + Math.random() * 10,
    opacity: 1,
    gravity: 0.35 + Math.random() * 0.25,
    drag: 0.985 + Math.random() * 0.01,
  };
}

function useConfetti(active: boolean) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Two bursts — one immediate, one delayed
    let particles: Particle[] = Array.from({ length: 160 }, () => makeParticle(canvas));
    const burst2Timer = setTimeout(() => {
      if (!canvasRef.current) return;
      particles = [
        ...particles,
        ...Array.from({ length: 80 }, () => makeParticle(canvasRef.current!)),
      ];
    }, 400);

    let raf: number;
    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        p.vy += p.gravity;
        p.vx *= p.drag;
        p.vy *= p.drag;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;

        // Fade out as they approach the bottom
        if (p.y > canvas.height * 0.75) {
          p.opacity -= 0.025;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;

        if (p.shape === "circle") {
          ctx.beginPath();
          ctx.arc(0, 0, p.r, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        }
        ctx.restore();
      }

      // Remove fully faded particles
      particles = particles.filter((p) => p.opacity > 0 && p.y < canvas.height + 40);

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
      clearTimeout(burst2Timer);
      window.removeEventListener("resize", onResize);
    };
  }, [active]);

  return canvasRef;
}

// ---------------------------------------------------------------------------
// Modal
// ---------------------------------------------------------------------------

interface PublishSuccessModalProps {
  formId: string;
  slug: string | null;
  onClose: () => void;
}

export function PublishSuccessModal({ formId, slug, onClose }: PublishSuccessModalProps) {
  const [visible, setVisible] = useState(false);
  const canvasRef = useConfetti(true);

  // Stagger the modal card entrance slightly after mount
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/f/${slug || formId}`
      : `/f/${slug || formId}`;

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
  };

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 250);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={handleClose}
    >
      {/* Confetti canvas — sits behind the modal card */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none fixed inset-0 z-50"
        aria-hidden
      />

      {/* Dim backdrop */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />

      {/* Modal card */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          transform: visible ? "translateY(0) scale(1)" : "translateY(24px) scale(0.96)",
          opacity: visible ? 1 : 0,
          transition: "transform 0.35s cubic-bezier(0.34,1.56,0.64,1), opacity 0.25s ease",
        }}
        className="relative z-50 mx-4 w-full max-w-md rounded-3xl bg-white px-8 py-10 shadow-2xl"
      >
        {/* Close */}
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-ink-soft/50 transition hover:bg-paper-soft hover:text-ink"
          aria-label="Close"
        >
          ✕
        </button>

        {/* Icon */}
        <div className="mb-5 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="16" fill="#10b981" opacity="0.15" />
              <path
                d="M9 17l5 5 9-9"
                stroke="#10b981"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* Copy */}
        <h2 className="mb-2 text-center text-2xl font-bold tracking-tight text-ink">
          Your form is live! 🎉
        </h2>
        <p className="mb-7 text-center text-sm text-ink-soft">
          Share the link below and start collecting responses.
        </p>

        {/* Share URL row */}
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-line bg-paper-soft px-4 py-3">
          <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink-soft">
            {shareUrl}
          </span>
          <button
            onClick={copyLink}
            className="shrink-0 rounded-lg bg-ink px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-ink/80 active:scale-95"
          >
            Copy link
          </button>
        </div>

        {/* Open in new tab */}
        <a
          href={shareUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mb-6 flex w-full items-center justify-center gap-2 rounded-xl border border-line py-2.5 text-sm font-semibold text-ink transition hover:bg-paper-soft"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M2 12L12 2M12 2H6M12 2V8"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Open form
        </a>

        <button
          onClick={handleClose}
          className="w-full rounded-xl py-2.5 text-sm font-semibold text-ink-soft transition hover:text-ink"
        >
          Back to builder
        </button>
      </div>
    </div>
  );
}
