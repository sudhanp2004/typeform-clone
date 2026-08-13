export function ComingSoonPanel({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-paper-soft text-2xl">{icon}</div>
      <h2 className="text-lg font-semibold text-ink">{title}</h2>
      <p className="max-w-sm text-sm text-ink-soft">{description}</p>
      <span className="mt-1 rounded-full bg-paper-soft px-3 py-1 text-xs font-semibold uppercase tracking-wide text-ink-soft">
        Coming soon
      </span>
    </div>
  );
}
