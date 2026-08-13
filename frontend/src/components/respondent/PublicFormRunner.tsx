"use client";

import { useEffect, useRef, useState } from "react";
import { getPublicForm, startPublicResponse, submitPublicResponse } from "@/lib/api";
import type { PublicForm } from "@/lib/types";
import { RespondentFlow } from "./RespondentFlow";

type LoadState = "loading" | "ready" | "not_found";

export function PublicFormRunner({ formId }: { formId: string }) {
  const [state, setState] = useState<LoadState>("loading");
  const [form, setForm] = useState<PublicForm | null>(null);
  const responseIdRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [formData, { response_id }] = await Promise.all([
          getPublicForm(formId),
          startPublicResponse(formId),
        ]);
        if (cancelled) return;
        responseIdRef.current = response_id;
        setForm(formData);
        setState("ready");
      } catch {
        if (cancelled) return;
        setState("not_found");
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [formId]);

  if (state === "loading") {
    return <div className="flex min-h-screen flex-1 items-center justify-center text-ink-soft">Loading form…</div>;
  }

  if (state === "not_found" || !form) {
    return (
      <div className="flex min-h-screen flex-1 flex-col items-center justify-center gap-2 px-6 text-center">
        <h1 className="text-2xl font-bold text-ink">This form isn&apos;t available</h1>
        <p className="text-ink-soft">It may be unpublished, deleted, or the link is incorrect.</p>
      </div>
    );
  }

  const handleComplete = async (answers: Record<string, unknown>) => {
    const responseId = responseIdRef.current;
    if (!responseId) return;
    const payload = Object.entries(answers).map(([question_id, value]) => ({ question_id, value }));
    await submitPublicResponse(formId, responseId, payload, true);
  };

  return <RespondentFlow form={form} onComplete={handleComplete} />;
}
