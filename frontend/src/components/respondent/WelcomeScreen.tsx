"use client";

import { motion } from "framer-motion";

export function WelcomeScreen({
  title,
  subtitle,
  accentColor,
  onStart,
  questionCount,
}: {
  title: string;
  subtitle?: string;
  accentColor: string;
  onStart: () => void;
  questionCount: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-6 py-24 text-center sm:text-left"
    >
      <h1 className="text-3xl font-bold leading-tight text-ink sm:text-4xl">{title}</h1>
      {subtitle && <p className="mt-3 text-lg text-ink-soft">{subtitle}</p>}
      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
        <button
          onClick={onStart}
          className="rounded-full px-7 py-3 text-base font-semibold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: accentColor }}
        >
          Start
        </button>
        <span className="text-sm text-ink-soft">
          {questionCount} question{questionCount === 1 ? "" : "s"} · press{" "}
          <kbd className="rounded border border-line px-1.5 py-0.5">Enter ↵</kbd>
        </span>
      </div>
    </motion.div>
  );
}
