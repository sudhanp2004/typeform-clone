"use client";

import { useState } from "react";
import type { FormTheme } from "@/lib/types";
import { THEME_FONTS } from "@/lib/fonts";

const ACCENT_PRESETS = ["#262626", "#e0431f", "#2b6cb0", "#38a169", "#9333ea", "#db2777", "#d97706", "#0891b2"];
const BACKGROUND_PRESETS = ["#ffffff", "#f6f4f0", "#f5f5f4", "#eef2ff", "#fef3f2", "#f0fdf4", "#fefce8"];

interface DesignPanelProps {
  theme: FormTheme;
  onUpdate: (patch: Partial<FormTheme>) => void;
  onClose: () => void;
}

export function DesignPanel({ theme, onUpdate, onClose }: DesignPanelProps) {
  const [activeTab, setActiveTab] = useState<"my_themes" | "gallery">("my_themes");
  const accentColor = theme.accent_color || ACCENT_PRESETS[0];
  const backgroundColor = theme.background || BACKGROUND_PRESETS[0];
  const font = theme.font || THEME_FONTS[0].key;

  return (
    <div className="absolute left-0 top-full z-50 mt-1.5 w-80 overflow-hidden rounded-xl border border-line bg-white shadow-xl cursor-default">
      {/* Popover Header */}
      <div className="flex items-center justify-between px-3 py-2">
        <div className="flex items-center gap-2">
          <span className="text-ink-soft opacity-50">⠿</span>
          <span className="text-sm font-semibold text-ink">Design</span>
        </div>
        <button onClick={onClose} className="p-1 text-ink-soft hover:text-ink">✕</button>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 px-4 text-sm font-medium border-b border-line">
        <button 
          onClick={() => setActiveTab("my_themes")}
          className={`pb-2 ${activeTab === "my_themes" ? "border-b-2 border-ink text-ink" : "text-ink-soft"}`}
        >
          My themes
        </button>
        <button 
          onClick={() => setActiveTab("gallery")}
          className={`pb-2 ${activeTab === "gallery" ? "border-b-2 border-ink text-ink" : "text-ink-soft"}`}
        >
          Gallery
        </button>
      </div>

      {/* Content */}
      <div className="max-h-[60vh] overflow-y-auto p-4">
        {activeTab === "gallery" ? (
          <div className="py-8 text-center text-sm text-ink-soft">
            Gallery coming soon.
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between rounded-lg bg-paper-soft px-3 py-2 text-sm">
              <span className="flex items-center gap-1.5 font-medium text-ink">
                Brand kit themes <span className="text-emerald-500">◈</span>
              </span>
              <button className="rounded border border-line bg-white px-2 py-0.5 text-xs font-semibold text-ink shadow-sm">
                Manage
              </button>
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold text-ink">Accent color</p>
              <div className="flex flex-wrap gap-2">
                {ACCENT_PRESETS.map((color) => (
                  <button
                    key={color}
                    onClick={() => onUpdate({ accent_color: color })}
                    className={`h-6 w-6 rounded-full border border-black/10 ${accentColor === color ? "ring-2 ring-ink ring-offset-2" : ""}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold text-ink">Background color</p>
              <div className="flex flex-wrap gap-2">
                {BACKGROUND_PRESETS.map((color) => (
                  <button
                    key={color}
                    onClick={() => onUpdate({ background: color })}
                    className={`h-6 w-6 rounded-full border border-black/10 ${backgroundColor === color ? "ring-2 ring-ink ring-offset-2" : ""}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold text-ink">Font</p>
              <div className="flex flex-col gap-1.5">
                {THEME_FONTS.map((f) => (
                  <button
                    key={f.key}
                    onClick={() => onUpdate({ font: f.key })}
                    style={{ fontFamily: f.family }}
                    className={`rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                      font === f.key ? "border-ink bg-paper-soft" : "border-line hover:border-ink/40"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

