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
  const meta = COPY[kind];

  const commit = (patch: Partial<ScreenContent>) => onUpdate({ title, subtitle, ...patch });

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-8 py-16">
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
  );
}
