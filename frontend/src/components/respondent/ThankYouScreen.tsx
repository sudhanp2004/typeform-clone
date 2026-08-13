"use client";

import { motion } from "framer-motion";

export function ThankYouScreen({
  title,
  subtitle,
  accentColor,
}: {
  title: string;
  subtitle?: string;
  accentColor: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center px-6 py-24 text-center"
    >
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
        className="mb-6 flex h-16 w-16 items-center justify-center rounded-full text-2xl text-white"
        style={{ backgroundColor: accentColor }}
      >
        ✓
      </motion.div>
      <h1 className="text-3xl font-bold text-ink sm:text-4xl">{title}</h1>
      {subtitle && <p className="mt-3 text-lg text-ink-soft">{subtitle}</p>}
    </motion.div>
  );
}
