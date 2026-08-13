"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import type { FormStatus } from "@/lib/types";

export type BuilderTab = "content" | "workflow" | "connect" | "share";

interface BuilderHeaderProps {
  formId: string;
  slug: string | null;
  title: string;
  status: FormStatus;
  activeTab: BuilderTab;
  onTabChange: (tab: BuilderTab) => void;
  onRename: (title: string) => void;
  onTogglePublish: () => void;
  onPreview: () => void;
}

const TABS: { id: BuilderTab; label: string }[] = [
  { id: "content", label: "Content" },
  { id: "workflow", label: "Workflow" },
  { id: "connect", label: "Connect" },
  { id: "share", label: "Share" },
];

export function BuilderHeader({
  formId,
  slug,
  title,
  status,
  activeTab,
  onTabChange,
  onRename,
  onTogglePublish,
  onPreview,
}: BuilderHeaderProps) {
  const [localTitle, setLocalTitle] = useState(title);
  const { showToast } = useToast();

  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/f/${slug || formId}` : "";

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    showToast("Link copied to clipboard", "success");
  };

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-line bg-white px-4">
      <div className="flex min-w-0 flex-1 items-center gap-2 text-sm">
        <Link href="/forms" className="shrink-0 text-ink-soft hover:text-ink">
          Forms
        </Link>
        <span className="shrink-0 text-ink-soft/50">›</span>
        <input
          value={localTitle}
          onChange={(e) => setLocalTitle(e.target.value)}
          onBlur={() => localTitle.trim() && onRename(localTitle.trim())}
          className="min-w-0 max-w-xs truncate rounded-md px-2 py-1 font-semibold text-ink hover:bg-paper-soft focus:bg-paper-soft focus:outline-none"
        />
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
            status === "published" ? "bg-emerald-50 text-emerald-700" : "bg-paper-soft text-ink-soft"
          }`}
        >
          {status === "published" ? "Published" : "Draft"}
        </span>
      </div>

      <nav className="flex shrink-0 items-center gap-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`rounded-lg px-3.5 py-1.5 text-sm font-semibold transition-colors ${
              activeTab === tab.id ? "bg-paper-soft text-ink" : "text-ink-soft hover:text-ink"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <div className="flex flex-1 shrink-0 items-center justify-end gap-2">
        {status === "published" && (
          <>
            <Link href={`/forms/${formId}/responses`}>
              <Button variant="ghost">Results</Button>
            </Link>
            <Button variant="secondary" onClick={copyLink}>
              Copy link
            </Button>
          </>
        )}
        <Button variant="secondary" onClick={onPreview}>
          Preview
        </Button>
        <Button onClick={onTogglePublish}>{status === "published" ? "Unpublish" : "Publish"}</Button>
      </div>
    </header>
  );
}
