"use client";

interface BuilderToolbarProps {
  onAddClick: () => void;
  onPreviewClick: () => void;
}

const UTILITY_ICONS: { glyph: string; label: string }[] = [
  { glyph: "▭", label: "Device preview" },
  { glyph: "▶", label: "Run form" },
  { glyph: "♿", label: "Accessibility check" },
  { glyph: "↻", label: "Version history" },
  { glyph: "Aあ", label: "Translate" },
  { glyph: "⚙", label: "Settings" },
];

export function BuilderToolbar({ onAddClick, onPreviewClick }: BuilderToolbarProps) {
  return (
    <div className="flex shrink-0 items-center gap-3 border-b border-line bg-paper-soft/60 px-4 py-2.5">
      <button
        className="flex w-56 shrink-0 items-center justify-between gap-2 rounded-lg bg-white px-3 py-2 text-sm font-medium text-ink shadow-sm"
        title="Form mode"
      >
        <span className="flex items-center gap-2">
          <span aria-hidden className="text-ink-soft">
            ☰
          </span>
          Universal mode
        </span>
        <span className="text-ink-soft/60">▾</span>
      </button>

      <div className="flex flex-1 items-center gap-1 rounded-lg bg-white px-2 py-1.5 shadow-sm">
        <button
          onClick={onAddClick}
          className="flex items-center gap-1.5 rounded-md bg-ink px-3 py-1.5 text-sm font-semibold text-white hover:bg-neutral-800"
        >
          + Add content
        </button>

        <button className="ml-1 flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium text-ink-soft hover:bg-paper-soft hover:text-ink">
          <span aria-hidden className="h-3.5 w-3.5 rounded-full bg-gradient-to-br from-rose-300 via-amber-300 to-sky-400" />
          Design
        </button>

        <div className="mx-1 h-5 w-px bg-line" />

        {UTILITY_ICONS.map(({ glyph, label }, i) => (
          <button
            key={label}
            onClick={i === 1 ? onPreviewClick : undefined}
            title={label}
            aria-label={label}
            className="flex h-8 w-8 items-center justify-center rounded-md text-sm text-ink-soft hover:bg-paper-soft hover:text-ink"
          >
            {glyph}
          </button>
        ))}
      </div>
    </div>
  );
}
