"use client";

// Mirrors the real Typeform admin's top chrome: an organization avatar, an
// account avatar, and a Forms/Contacts/Automations tab bar. Only "Forms" is a
// real section in this app — Contacts and Automations have no backing
// feature, so they're shown disabled with a "Soon" badge rather than as
// buttons that do nothing when clicked.

const INACTIVE_TABS = ["Contacts", "Automations"];

export function WorkspaceHeader() {
  return (
    <div className="border-b border-line bg-white">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-3">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-full bg-ink text-xs font-bold text-white"
          aria-label="Organization"
        >
          S
        </div>
        <div
          className="flex h-8 w-8 items-center justify-center rounded-full bg-paper-soft text-xs font-bold text-ink-soft"
          aria-label="Account"
        >
          SP
        </div>
      </div>
      <div className="mx-auto flex w-full max-w-5xl items-center gap-1 px-6">
        <span className="border-b-2 border-ink px-3 py-2.5 text-sm font-semibold text-ink">Forms</span>
        {INACTIVE_TABS.map((tab) => (
          <span
            key={tab}
            className="flex cursor-not-allowed items-center gap-1.5 px-3 py-2.5 text-sm font-medium text-ink-soft/50"
          >
            {tab}
            <span className="rounded-full bg-paper-soft px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
              Soon
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
