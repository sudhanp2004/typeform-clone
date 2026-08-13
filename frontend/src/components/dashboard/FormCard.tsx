"use client";

import Link from "next/link";
import { useState } from "react";
import type { FormListItem } from "@/lib/types";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export function FormCard({
  form,
  onDuplicate,
  onDelete,
}: {
  form: FormListItem;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="group relative rounded-2xl border border-line bg-white p-5 transition-shadow hover:shadow-md">
      <Link href={`/forms/${form.id}/edit`} className="block">
        <div className="mb-8 flex items-start justify-between">
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
              form.status === "published" ? "bg-emerald-50 text-emerald-700" : "bg-paper-soft text-ink-soft"
            }`}
          >
            {form.status === "published" ? "Published" : "Draft"}
          </span>
        </div>
        <h3 className="mb-1 line-clamp-2 text-base font-semibold text-ink">{form.title}</h3>
        <p className="text-xs text-ink-soft">
          {form.response_count} response{form.response_count === 1 ? "" : "s"} · Updated {formatDate(form.updated_at)}
        </p>
      </Link>

      <div className="absolute right-3 top-3">
        <button
          aria-label="Form actions"
          onClick={(e) => {
            e.preventDefault();
            setMenuOpen((v) => !v);
          }}
          className="rounded-full p-1.5 text-ink-soft opacity-0 hover:bg-paper-soft hover:text-ink group-hover:opacity-100"
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
