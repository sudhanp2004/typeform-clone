"use client";

import Link from "next/link";
import { useState } from "react";
import type { FormListItem } from "@/lib/types";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function completionRate(form: FormListItem): string {
  if (form.total_response_count === 0) return "—";
  return `${Math.round((form.response_count / form.total_response_count) * 100)}%`;
}

export function FormsTable({
  forms,
  onDuplicate,
  onDelete,
}: {
  forms: FormListItem[];
  onDuplicate: (formId: string) => void;
  onDelete: (formId: string) => void;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-white">
      <div className="grid grid-cols-[1fr_100px_100px_120px_100px_40px] gap-2 border-b border-line bg-paper-soft px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-ink-soft">
        <span>Name</span>
        <span>Responses</span>
        <span>Completed</span>
        <span>Updated</span>
        <span>Integrations</span>
        <span />
      </div>
      {forms.map((form) => (
        <FormRow key={form.id} form={form} onDuplicate={() => onDuplicate(form.id)} onDelete={() => onDelete(form.id)} />
      ))}
    </div>
  );
}

function FormRow({ form, onDuplicate, onDelete }: { form: FormListItem; onDuplicate: () => void; onDelete: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="grid grid-cols-[1fr_100px_100px_120px_100px_40px] items-center gap-2 border-b border-line px-4 py-3 text-sm last:border-b-0 hover:bg-paper-soft/60">
      <Link href={`/forms/${form.id}/edit`} className="flex min-w-0 items-center gap-2">
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
            form.status === "published" ? "bg-emerald-50 text-emerald-700" : "bg-paper-soft text-ink-soft"
          }`}
        >
          {form.status === "published" ? "Published" : "Draft"}
        </span>
        <span className="truncate font-medium text-ink">{form.title}</span>
      </Link>
      <span className="text-ink-soft">{form.response_count}</span>
      <span className="text-ink-soft">{completionRate(form)}</span>
      <span className="text-ink-soft">{formatDate(form.updated_at)}</span>
      <span>
        <button
          disabled
          aria-label="Integrations coming soon"
          title="Integrations — coming soon"
          className="flex h-7 w-7 items-center justify-center rounded-md border border-line text-ink-soft/40"
        >
          +
        </button>
      </span>
      <div className="relative">
        <button
          aria-label="Form actions"
          onClick={() => setMenuOpen((v) => !v)}
          className="rounded-full p-1.5 text-ink-soft hover:bg-paper-soft hover:text-ink"
        >
          ⋯
        </button>
        {menuOpen && (
          <div
            className="absolute right-0 z-10 mt-1 w-40 rounded-lg border border-line bg-white py-1 text-sm shadow-lg"
            onMouseLeave={() => setMenuOpen(false)}
          >
            {form.status === "published" && (
              <Link
                href={`/forms/${form.id}/responses`}
                className="block px-3 py-2 hover:bg-paper-soft"
                onClick={() => setMenuOpen(false)}
              >
                View responses
              </Link>
            )}
            <button
              className="block w-full px-3 py-2 text-left hover:bg-paper-soft"
              onClick={() => {
                setMenuOpen(false);
                onDuplicate();
              }}
            >
              Duplicate
            </button>
            <button
              className="block w-full px-3 py-2 text-left text-danger hover:bg-paper-soft"
              onClick={() => {
                setMenuOpen(false);
                onDelete();
              }}
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
