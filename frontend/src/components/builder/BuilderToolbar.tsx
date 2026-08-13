"use client";

import { useEffect, useRef, useState } from "react";
import type { FormMode, FormTheme } from "@/lib/types";
import { DesignPanel } from "./DesignPanel";

const MODES: { id: FormMode; label: string; description: string; icon: string; locked?: boolean }[] = [
  { id: "universal", label: "Universal mode", description: "Create any form.", icon: "☰" },
  { id: "lead_qualification", label: "Lead qualification mode", description: "Score and prioritize leads.", icon: "◎" },
  { id: "knowledge_quiz", label: "Knowledge quiz mode", description: "Set correct answers.", icon: "✓" },
  { id: "match_quiz", label: "Match quiz mode", description: "Assign answers to endings.", icon: "◈", locked: true },
];

interface BuilderToolbarProps {
  formMode: FormMode;
  onModeChange: (mode: FormMode) => void;
  onAddClick: () => void;
  onPreviewClick: () => void;
  theme: FormTheme;
  onUpdateTheme: (patch: Partial<FormTheme>) => void;
  device: "desktop" | "mobile";
  onToggleDevice: () => void;
}

export function BuilderToolbar({ formMode, onModeChange, onAddClick, onPreviewClick, theme, onUpdateTheme, device, onToggleDevice }: BuilderToolbarProps) {
  const [open, setOpen] = useState(false);
  const [designOpen, setDesignOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const designRef = useRef<HTMLDivElement>(null);
  const currentMode = MODES.find((m) => m.id === formMode) ?? MODES[0];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
      if (designRef.current && !designRef.current.contains(e.target as Node)) setDesignOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="flex shrink-0 items-center gap-3 border-b border-line bg-paper-soft/60 px-4 py-2.5">
      {/* Mode selector */}
      <div ref={ref} className="relative">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex w-56 shrink-0 items-center justify-between gap-2 rounded-lg bg-white px-3 py-2 text-sm font-medium text-ink shadow-sm hover:shadow-md transition"
          title="Form mode"
        >
          <span className="flex items-center gap-2">
            <span aria-hidden className="text-ink-soft">{currentMode.icon}</span>
            {currentMode.label}
          </span>
          <span className="text-ink-soft/60">▾</span>
        </button>

        {open && (
          <div className="absolute left-0 top-full z-50 mt-1.5 w-64 overflow-hidden rounded-xl border border-line bg-white shadow-xl">
            {MODES.map((mode) => (
              <button
                key={mode.id}
                onClick={() => {
                  if (!mode.locked) { onModeChange(mode.id); setOpen(false); }
                }}
                className={`flex w-full items-start gap-3 px-4 py-3 text-left transition ${
                  mode.id === formMode ? "bg-paper-soft" : "hover:bg-paper-soft/60"
                } ${mode.locked ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded bg-ink/8 text-sm text-ink-soft">
                  {mode.icon}
                </span>
                <span>
                  <span className="flex items-center gap-1.5">
                    <span className="block text-sm font-semibold text-ink">{mode.label}</span>
                    {mode.locked && <span className="text-xs text-ink-soft/50">◆</span>}
                  </span>
                  <span className="block text-xs text-ink-soft">{mode.description}</span>
                </span>
                {mode.id === formMode && (
                  <span className="ml-auto mt-0.5 text-emerald-500">✓</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Rest of toolbar stays the same */}
      <div className="flex flex-1 items-center gap-1 rounded-lg bg-white px-2 py-1.5 shadow-sm">
        <button
          onClick={onAddClick}
          className="flex items-center gap-1.5 rounded-md bg-ink px-3 py-1.5 text-sm font-semibold text-white hover:bg-neutral-800"
        >
          + Add content
        </button>
        <div className="relative ml-1" ref={designRef}>
          <button
            onClick={() => setDesignOpen((v) => !v)}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors ${
              designOpen ? "bg-paper-soft text-ink" : "text-ink-soft hover:bg-paper-soft hover:text-ink"
            }`}
          >
            <span aria-hidden className="h-3.5 w-3.5 rounded-full bg-gradient-to-br from-rose-300 via-amber-300 to-sky-400" />
            Design
          </button>
          
          {designOpen && (
            <DesignPanel
              theme={theme}
              onUpdate={onUpdateTheme}
              onClose={() => setDesignOpen(false)}
            />
          )}
        </div>
        <div className="mx-1 h-5 w-px bg-line" />
        {/* Utility icons */}
        {[
          { glyph: device === "desktop" ? "📱" : "💻", label: "Device preview", onClick: onToggleDevice },
          { glyph: "▶", label: "Run form", onClick: onPreviewClick },
          { glyph: "♿", label: "Accessibility check" },
          { glyph: "↻", label: "Version history" },
          { glyph: "Aあ", label: "Translate" },
          { glyph: "⚙", label: "Settings" },
        ].map(({ glyph, label, onClick }: { glyph: string; label: string; onClick?: () => void }) => (
          <button
            key={label}
            onClick={onClick}
            title={label}
            aria-label={label}
            className={`flex h-8 w-8 items-center justify-center rounded-md text-sm transition-colors ${
              label === "Device preview" && device === "mobile"
                ? "bg-ink/10 text-ink"
                : "text-ink-soft hover:bg-paper-soft hover:text-ink"
            }`}
          >
            {glyph}
          </button>
        ))}
      </div>
    </div>
  );
}
