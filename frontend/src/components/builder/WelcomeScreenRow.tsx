import type { ScreenContent } from "@/lib/types";

export function WelcomeScreenRow({
  screen,
  selected,
  onSelect,
}: {
  screen: ScreenContent;
  selected: boolean;
  onSelect: () => void;
}) {
  const hasContent = Boolean(screen.title);

  if (!hasContent) {
    return (
      <div className="border-t border-line bg-paper-soft/60 p-3">
        <button
          onClick={onSelect}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-line py-2.5 text-sm font-semibold text-ink-soft hover:border-ink hover:text-ink"
        >
          <span aria-hidden>→</span>
          Add Welcome Screen
        </button>
      </div>
    );
  }

  return (
    <div className="border-t border-line bg-paper-soft/60 p-3">
      <button
        onClick={onSelect}
        className={`flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left text-sm transition-colors ${
          selected ? "bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05)] ring-1 ring-ink/5" : "hover:bg-white/50"
        }`}
      >
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-ink text-[10px] font-bold text-white">
          →
        </span>
        <span className="truncate text-ink">{screen.title}</span>
      </button>
    </div>
  );
}
