"use client";

import { useEffect, useState } from "react";
import type { FormStatus } from "@/lib/types";

interface SharePanelProps {
  formId: string;
  slug: string | null;
  status: FormStatus;
}

export function SharePanel({ formId, slug, status }: SharePanelProps) {
  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/f/${slug || formId}`
      : `/f/${slug || formId}`;

  const [copied, setCopied] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [editingSlug, setEditingSlug] = useState(false);
  // Slide-in from right on mount
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (status !== "published") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4">
        <div className="text-4xl">🔒</div>
        <p className="text-lg font-semibold text-ink">Publish your form to share it</p>
        <p className="text-sm text-ink-soft">Click the Publish button to make your form live.</p>
      </div>
    );
  }

  return (
    <div
      className="flex flex-1 flex-col overflow-y-auto bg-white"
      style={{
        transform: ready ? "translateX(0)" : "translateX(60px)",
        opacity: ready ? 1 : 0,
        transition: "transform 0.38s cubic-bezier(0.22,1,0.36,1), opacity 0.28s ease",
      }}
    >
      <div className="mx-auto w-full max-w-2xl px-6 py-12">
        {/* Heading */}
        <h1 className="mb-8 text-center text-[1.6rem] font-semibold tracking-tight text-ink">
          Choose how you&apos;d like to share your form
        </h1>

        {/* Copy link row */}
        <div className="mb-6 rounded-2xl border border-line bg-white p-2 shadow-sm">
          <div className="flex items-center gap-2">
            <button
              onClick={copyLink}
              className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                copied
                  ? "bg-emerald-600 text-white"
                  : "bg-ink text-white hover:bg-ink/85"
              }`}
            >
              {/* Link icon */}
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path
                  d="M6.5 9.5a4.243 4.243 0 0 0 6 0l2-2a4.243 4.243 0 0 0-6-6l-1 1"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <path
                  d="M9.5 6.5a4.243 4.243 0 0 0-6 0l-2 2a4.243 4.243 0 0 0 6 6l1-1"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              {copied ? "Copied!" : "Copy link"}
            </button>
            <span className="flex-1 truncate px-2 text-sm text-ink-soft">{shareUrl}</span>
            <div className="flex shrink-0 items-center gap-1">
              <button className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-ink-soft transition hover:bg-paper-soft hover:text-ink">
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M11 2H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1ZM8 12v-4M8 6V5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
                Edit
              </button>
              <button className="rounded-lg p-2 text-ink-soft transition hover:bg-paper-soft hover:text-ink">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <rect x="1" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
                  <rect x="9" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
                  <rect x="1" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
                  <rect x="9" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Link preview */}
        <div className="mb-8">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-medium text-ink-soft">Link preview</span>
            <button className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-ink-soft transition hover:bg-paper-soft hover:text-ink">
              Customize
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
          <div className="flex items-center gap-4 rounded-2xl border border-line bg-white px-5 py-4">
            <div className="flex h-12 w-16 shrink-0 items-center justify-center rounded-lg bg-[#191919]">
              <span className="text-xs font-bold tracking-wider text-white">tf</span>
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-ink">Your form</p>
              <p className="truncate text-xs text-ink-soft/70">Fill out this form — powered by your Typeform clone</p>
              <p className="truncate text-xs text-ink-soft/40">{typeof window !== 'undefined' ? window.location.host : ''}</p>
            </div>
          </div>
        </div>

        {/* Embed form */}
        <div>
          <h2 className="mb-4 text-sm font-semibold text-ink">Embed form</h2>
          <div className="grid grid-cols-2 gap-4">
            {/* On your website */}
            <button className="group overflow-hidden rounded-2xl border border-line bg-white text-left shadow-sm transition hover:border-ink/30 hover:shadow-md">
              <div className="h-36 w-full overflow-hidden bg-purple-100">
                <div className="flex h-full items-end justify-center pb-0">
                  <div className="relative w-40">
                    <div className="absolute bottom-0 left-4 h-28 w-28 rounded-t-xl bg-purple-200/80" />
                    <div className="absolute bottom-0 right-0 h-32 w-24 overflow-hidden rounded-t-xl bg-white shadow-lg">
                      <div className="h-3 w-full bg-purple-400" />
                      <div className="space-y-1.5 p-2">
                        <div className="h-1.5 w-full rounded bg-gray-200" />
                        <div className="h-1.5 w-3/4 rounded bg-gray-200" />
                        <div className="mt-2 h-4 w-full rounded bg-purple-300" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="px-4 py-3">
                <p className="text-sm font-semibold text-ink">On your website</p>
              </div>
            </button>

            {/* In your email */}
            <button className="group overflow-hidden rounded-2xl border border-line bg-white text-left shadow-sm transition hover:border-ink/30 hover:shadow-md">
              <div className="h-36 w-full overflow-hidden bg-blue-50">
                <div className="flex h-full items-end justify-center pb-0">
                  <div className="relative w-44">
                    <div className="absolute bottom-0 left-0 right-0 mx-auto h-28 w-40 overflow-hidden rounded-t-xl border border-gray-200 bg-white shadow-md">
                      <div className="flex h-8 items-center gap-2 border-b border-gray-100 px-3">
                        <div className="h-4 w-4 rounded-full bg-gray-200" />
                        <div className="h-2 w-20 rounded bg-gray-200" />
                      </div>
                      <div className="space-y-1.5 p-3">
                        <div className="h-1.5 w-full rounded bg-gray-200" />
                        <div className="h-1.5 w-2/3 rounded bg-gray-200" />
                        <div className="mt-2 h-5 w-24 rounded-md bg-blue-400" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="px-4 py-3">
                <p className="text-sm font-semibold text-ink">In your email</p>
              </div>
            </button>
          </div>

          <p className="mt-6 text-center text-sm text-ink-soft/50">Explore other ways to share</p>
        </div>
      </div>
    </div>
  );
}
