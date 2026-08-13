function IconBadge({ label }: { label: string }) {
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-line bg-white text-[10px] font-bold text-ink-soft">
      {label}
    </span>
  );
}

function AddButton() {
  return (
    <button
      aria-label="Add"
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-line bg-white text-ink-soft hover:border-ink hover:text-ink"
    >
      +
    </button>
  );
}

function ActionCard({
  icon,
  title,
  badge,
  description,
  children,
}: {
  icon: string;
  title: string;
  badge?: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-line bg-white p-3.5">
      <div className="mb-3 flex items-start gap-2.5">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-paper-soft text-sm text-ink-soft">
          {icon}
        </span>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-semibold text-ink">{title}</span>
            {badge && (
              <span className="rounded-full bg-ink px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
                {badge}
              </span>
            )}
          </div>
          {description && <p className="mt-0.5 text-xs text-ink-soft">{description}</p>}
        </div>
      </div>
      <div className="flex gap-1.5">{children}</div>
    </div>
  );
}

export function ActionsDrawer() {
  return (
    <aside className="w-72 shrink-0 overflow-y-auto border-l border-line bg-paper-soft/40 p-4">
      <h3 className="mb-3 text-sm font-semibold text-ink">Actions</h3>
      <div className="flex flex-col gap-3">
        <ActionCard icon="⇄" title="Connect">
          <IconBadge label="GS" />
          <IconBadge label="XL" />
          <IconBadge label="Zap" />
          <AddButton />
        </ActionCard>

        <ActionCard
          icon="⚡"
          title="Automations"
          badge="New"
          description="Activate automations based on submissions to this form."
        >
          <IconBadge label="✉" />
          <IconBadge label="↗" />
          <AddButton />
        </ActionCard>

        <ActionCard icon="◔" title="Contacts" description="Map form responses to create or update your contacts.">
          <button
            aria-label="Manage contacts"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-line bg-white text-ink-soft hover:border-ink hover:text-ink"
          >
            ⚙
          </button>
        </ActionCard>
      </div>
    </aside>
  );
}
