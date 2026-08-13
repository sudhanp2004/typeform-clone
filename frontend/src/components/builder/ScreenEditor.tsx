"use client";

import { useState } from "react";
import type { ScreenContent } from "@/lib/types";
import { Textarea } from "@/components/ui/Input";

interface ScreenEditorProps {
  kind: "welcome" | "ending";
  screen: ScreenContent;
  onUpdate: (patch: ScreenContent) => void;
}

const COPY = {
  welcome: { icon: "→", label: "Welcome Screen", placeholder: "Welcome! Ready to get started?" },
  ending: { icon: "✓", label: "Thank You Screen", placeholder: "Thanks for completing this form!" },
};

export function ScreenEditor({ kind, screen, onUpdate }: ScreenEditorProps) {
  const [title, setTitle] = useState(screen.title ?? "");
  const [subtitle, setSubtitle] = useState(screen.subtitle ?? "");
  const [redirectUrl, setRedirectUrl] = useState(screen.redirect_url ?? "");
  const meta = COPY[kind];

  const isRedirect = kind === "ending" && screen.ending_type === "redirect";

  const commit = (patch: Partial<ScreenContent>) =>
    onUpdate({ title, subtitle, redirect_url: redirectUrl, ...screen, ...patch });

  // ── Redirect ending view ──────────────────────────────────────────────────
  if (isRedirect) {
    return (
      <div className="flex w-full flex-1 flex-col items-center justify-center p-4 sm:p-8">
        <div className="flex w-full max-w-3xl flex-col justify-center rounded-2xl bg-white px-8 py-16 shadow-[0_2px_12px_rgba(0,0,0,0.04)] sm:px-12">
        <div className="mb-5 flex h-6 w-6 items-center justify-center rounded bg-blue-500 text-xs font-bold text-white">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 6h8M6 2l4 4-4 4" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-soft">Redirect to URL</p>
        <p className="mb-6 text-sm text-ink-soft">
          After submitting, respondents will be redirected to this URL instead of seeing a thank-you screen.
        </p>

        <label className="mb-1.5 block text-xs font-semibold text-ink">Redirect URL</label>
        <div className="flex items-center gap-2 rounded-xl border-2 border-ink/10 px-3 py-2.5 focus-within:border-ink/40">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0 text-ink-soft">
            <path d="M7 1a6 6 0 1 0 0 12A6 6 0 0 0 7 1ZM1 7h12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            <path d="M7 1c-1.5 1.5-2.5 3.6-2.5 6s1 4.5 2.5 6M7 1c1.5 1.5 2.5 3.6 2.5 6S8.5 11.5 7 13" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
          <input
            type="url"
            value={redirectUrl}
            onChange={(e) => setRedirectUrl(e.target.value)}
            onBlur={() => commit({ redirect_url: redirectUrl })}
            placeholder="https://example.com/thank-you"
            className="flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink-soft/40"
          />
        </div>

        {redirectUrl && (
          <a
            href={redirectUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex items-center gap-1 text-xs text-blue-500 hover:underline"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M2 8L8 2M8 2H4M8 2V6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Open URL
          </a>
        )}
        </div>
      </div>
    );
  }

  // ── Default screen view ───────────────────────────────────────────────────
  return (
    <div className="flex w-full flex-1 flex-col items-center justify-center p-4 sm:p-8">
      <div className="flex w-full max-w-3xl flex-col justify-center rounded-2xl bg-white px-8 py-16 shadow-[0_2px_12px_rgba(0,0,0,0.04)] sm:px-12">
      <div className="mb-5 flex h-6 w-6 items-center justify-center rounded bg-ink text-xs font-bold text-white">
        {meta.icon}
      </div>
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-soft">{meta.label}</p>

      <Textarea
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={() => commit({ title })}
        placeholder={meta.placeholder}
        rows={2}
        className="!border-0 !border-b-2 !border-ink/10 !px-0 !py-2 text-2xl font-bold leading-snug !shadow-none focus:!border-ink sm:text-3xl"
      />

      <Textarea
        value={subtitle}
        onChange={(e) => setSubtitle(e.target.value)}
        onBlur={() => commit({ subtitle })}
        placeholder="Subtitle (optional)"
        rows={1}
        className="mt-3 !border-0 !px-0 !py-1 text-base italic text-ink-soft !shadow-none"
      />
      </div>
    </div>
  );
}
