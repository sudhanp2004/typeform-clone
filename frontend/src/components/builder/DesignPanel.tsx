"use client";

import type { FormTheme } from "@/lib/types";
import { THEME_FONTS } from "@/lib/fonts";
import { Modal } from "@/components/ui/Modal";

const ACCENT_PRESETS = ["#262626", "#e0431f", "#2b6cb0", "#38a169", "#9333ea", "#db2777", "#d97706", "#0891b2"];
// Kept light/neutral so the fixed ink-colored text used throughout the respondent flow
// stays readable without needing a separate per-theme text-color/contrast system. The
// custom color picker still allows any color — that tradeoff is then the creator's choice.
const BACKGROUND_PRESETS = ["#ffffff", "#f6f4f0", "#f5f5f4", "#eef2ff", "#fef3f2", "#f0fdf4", "#fefce8"];

interface DesignPanelProps {
  open: boolean;
  onClose: () => void;
  theme: FormTheme;
  onUpdate: (patch: Partial<FormTheme>) => void;
}

export function DesignPanel({ open, onClose, theme, onUpdate }: DesignPanelProps) {
  const accentColor = theme.accent_color || ACCENT_PRESETS[0];
  const backgroundColor = theme.background || BACKGROUND_PRESETS[0];
  const font = theme.font || THEME_FONTS[0].key;

  return (
    <Modal open={open} onClose={onClose} title="Design">
      <div className="flex flex-col gap-6">
        <ColorField
          label="Accent color"
          value={accentColor}
          presets={ACCENT_PRESETS}
          onChange={(value) => onUpdate({ accent_color: value })}
        />

        <ColorField
          label="Background color"
          value={backgroundColor}
          presets={BACKGROUND_PRESETS}
          onChange={(value) => onUpdate({ background: value })}
        />

        <div>
          <p className="mb-2 text-sm font-semibold text-ink">Font</p>
          <div className="flex flex-col gap-1.5">
            {THEME_FONTS.map((f) => (
              <button
                key={f.key}
                onClick={() => onUpdate({ font: f.key })}
                style={{ fontFamily: f.family }}
                className={`rounded-lg border px-3.5 py-2.5 text-left text-base transition-colors ${
                  font === f.key ? "border-ink bg-paper-soft" : "border-line hover:border-ink/40"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}

function ColorField({
  label,
  value,
  presets,
  onChange,
}: {
  label: string;
  value: string;
  presets: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <p className="mb-2 text-sm font-semibold text-ink">{label}</p>
      <div className="flex flex-wrap items-center gap-2">
        {presets.map((preset) => (
          <button
            key={preset}
            onClick={() => onChange(preset)}
            aria-label={preset}
            style={{ backgroundColor: preset }}
            className={`h-7 w-7 shrink-0 rounded-full border transition-transform ${
              value.toLowerCase() === preset.toLowerCase()
                ? "scale-110 border-ink ring-2 ring-ink ring-offset-2"
                : "border-line/60 hover:scale-105"
            }`}
          />
        ))}
        <label
          className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full border border-dashed border-line text-xs text-ink-soft hover:border-ink hover:text-ink"
          title="Custom color"
        >
          +
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="sr-only"
          />
        </label>
        <span className="ml-1 text-xs font-medium uppercase tracking-wide text-ink-soft">{value}</span>
      </div>
    </div>
  );
}
