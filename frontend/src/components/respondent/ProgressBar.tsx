"use client";

import { motion } from "framer-motion";

export function ProgressBar({ progress, accentColor }: { progress: number; accentColor: string }) {
  return (
    <div className="fixed left-0 right-0 top-0 z-20 h-1.5 bg-ink/5">
      <motion.div
        className="h-full"
        style={{ backgroundColor: accentColor }}
        animate={{ width: `${Math.round(progress * 100)}%` }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      />
    </div>
  );
}
