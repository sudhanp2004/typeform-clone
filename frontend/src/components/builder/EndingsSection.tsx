import type { ScreenContent } from "@/lib/types";

export function EndingsSection({
  screen,
  selected,
  onSelect,
}: {
  screen: ScreenContent;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <div className="border-t border-line bg-paper-soft/60 p-3">
      <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-ink-soft">Endings</p>
      <button
        onClick={onSelect}
        className={`flex w-full items-center gap-2 rounded-lg border px-2.5 py-2 text-left text-sm ${
          selected ? "border-ink bg-white shadow-sm" : "border-transparent hover:bg-white/70"
        }`}
      >
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-ink text-[10px] font-bold text-white">
          ✓
        </span>
        <span className="truncate text-ink">{screen.title || "Thank you screen"}</span>
      </button>
    </div>
  );
}
