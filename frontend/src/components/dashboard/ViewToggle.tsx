"use client";

export type ViewMode = "list" | "grid";

export function ViewToggle({ value, onChange }: { value: ViewMode; onChange: (value: ViewMode) => void }) {
  return (
    <div role="radiogroup" aria-label="View mode" className="inline-flex overflow-hidden rounded-lg border border-line">
      {(["list", "grid"] as ViewMode[]).map((mode) => (
        <button
          key={mode}
          type="button"
          role="radio"
          aria-checked={value === mode}
          onClick={() => onChange(mode)}
          className={`px-3 py-2 text-sm font-medium capitalize transition-colors ${
            value === mode ? "bg-ink text-white" : "bg-white text-ink-soft hover:bg-paper-soft"
          }`}
        >
          {mode}
        </button>
      ))}
    </div>
  );
}
