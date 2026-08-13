"use client";

import { useState } from "react";

export type SortOption = "updated" | "created" | "name";

const SORT_LABELS: Record<SortOption, string> = {
  updated: "Last updated",
  created: "Date created",
  name: "Name",
};

export function SortMenu({ value, onChange }: { value: SortOption; onChange: (value: SortOption) => void }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 rounded-lg border border-line bg-white px-3 py-2 text-sm font-medium text-ink hover:border-ink/30"
      >
        {SORT_LABELS[value]}
        <span className="text-ink-soft">▾</span>
      </button>
      {open && (
        <div
          className="absolute left-0 z-10 mt-1 w-40 rounded-lg border border-line bg-white py-1 text-sm shadow-lg"
          onMouseLeave={() => setOpen(false)}
        >
          {(Object.keys(SORT_LABELS) as SortOption[]).map((option) => (
            <button
              key={option}
              className={`block w-full px-3 py-2 text-left hover:bg-paper-soft ${option === value ? "font-semibold text-ink" : "text-ink-soft"}`}
              onClick={() => {
                onChange(option);
                setOpen(false);
              }}
            >
              {SORT_LABELS[option]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
