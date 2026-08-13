"use client";

import { useEffect, useRef, useState } from "react";
import type { ScreenContent } from "@/lib/types";

// ─── Icons ────────────────────────────────────────────────────────────────────

function EndScreenIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="1" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function RedirectIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function AppsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
      <rect x="9" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
      <rect x="1" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
      <rect x="9" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

function AutomationIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 2v3M8 11v3M2 8h3M11 8h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

// ─── Popover menu ─────────────────────────────────────────────────────────────

interface EndingPickerProps {
  onPick: (type: "screen" | "redirect") => void;
  onClose: () => void;
}

function EndingPickerPopover({ onPick, onClose }: EndingPickerProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute bottom-full left-0 z-50 mb-2 w-56 overflow-hidden rounded-xl border border-line bg-white shadow-xl"
    >
      {/* Choose an ending type */}
      <div className="px-3 pb-1 pt-3">
        <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-ink-soft/60">
          Choose an ending type
        </p>
        <button
          onClick={() => { onPick("screen"); onClose(); }}
          className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left text-sm font-medium text-ink transition hover:bg-paper-soft"
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-ink text-white">
            <EndScreenIcon />
          </span>
          End Screen
        </button>
        <button
          onClick={() => { onPick("redirect"); onClose(); }}
          className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left text-sm font-medium text-ink transition hover:bg-paper-soft"
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-line text-ink-soft">
            <RedirectIcon />
          </span>
          Redirect to URL
        </button>
      </div>

      <div className="mx-3 my-2 border-t border-line" />

      {/* Post-submit actions */}
      <div className="px-3 pb-3">
        <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-ink-soft/60">
          Post-submit actions
        </p>
        <button
          className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left text-sm font-medium text-ink/50 transition"
          disabled
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-line text-ink-soft/40">
            <AppsIcon />
          </span>
          Connect to apps
        </button>
        <button
          className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left text-sm font-medium text-ink/50 transition"
          disabled
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-line text-ink-soft/40">
            <AutomationIcon />
          </span>
          <span className="flex-1">Create automation</span>
          <span className="rounded-full bg-ink px-1.5 py-0.5 text-[10px] font-semibold text-white">
            New
          </span>
        </button>
      </div>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

export function EndingsSection({
  screen,
  selected,
  onSelect,
  onChangeType,
}: {
  screen: ScreenContent;
  selected: boolean;
  onSelect: () => void;
  onChangeType: (type: "screen" | "redirect") => void;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const endingType = screen.ending_type ?? "screen";

  return (
    <div className="relative border-t border-line bg-paper-soft/60 p-3">
      <div className="mb-2 flex items-center justify-between px-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">Endings</p>
        <button
          onClick={() => setPickerOpen((v) => !v)}
          className="flex h-5 w-5 items-center justify-center rounded text-ink-soft transition hover:bg-white hover:text-ink"
          title="Add ending type"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Ending item */}
      <button
        onClick={onSelect}
        className={`group relative flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left text-sm transition-colors ${
          selected ? "bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05)] ring-1 ring-ink/5" : "hover:bg-white/50"
        }`}
      >
        <span
          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded text-[10px] font-bold ${
            endingType === "redirect" ? "bg-blue-500 text-white" : "bg-ink text-white"
          }`}
        >
          {endingType === "redirect" ? (
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M2 5h6M5 2l3 3-3 3" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : "✓"}
        </span>
        <span className="truncate text-ink">
          {endingType === "redirect"
            ? (screen.redirect_url ? "Redirect to URL" : "Redirect to URL")
            : (screen.title || "Thank you screen")}
        </span>
        {endingType === "redirect" && (
          <span className="ml-auto shrink-0 rounded-full bg-blue-50 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-blue-500">
            Redirect
          </span>
        )}
      </button>

      {/* Popover */}
      {pickerOpen && (
        <EndingPickerPopover
          onPick={onChangeType}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </div>
  );
}
