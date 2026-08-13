"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { exportResponsesUrl, getForm, getResponse, getResponseSummary, listResponses } from "@/lib/api";
import type { FormDetail, QuestionSummary, ResponseDetail, ResponseListItem } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { QuestionSummaryCard } from "./QuestionSummaryCard";
import { ResponseDetailModal } from "./ResponseDetailModal";
import { CompletionFunnel } from "./CompletionFunnel";

function formatDateTime(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

export function ResponsesView({ formId }: { formId: string }) {
  const [form, setForm] = useState<FormDetail | null>(null);
  const [summary, setSummary] = useState<QuestionSummary[] | null>(null);
  const [responses, setResponses] = useState<ResponseListItem[] | null>(null);
  const [selectedResponse, setSelectedResponse] = useState<ResponseDetail | null>(null);
  const [notFound, setNotFound] = useState(false);
  const { showToast } = useToast();
  const router = useRouter();

  useEffect(() => {
    Promise.all([getForm(formId), getResponseSummary(formId), listResponses(formId)])
      .then(([formData, summaryData, responsesData]) => {
        setForm(formData);
        setSummary(summaryData);
        setResponses(responsesData);
      })
      .catch(() => {
        setNotFound(true);
        showToast("Form not found — it may have been deleted", "error");
        setTimeout(() => router.replace("/forms"), 2000);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formId]);

  const openResponse = async (responseId: string) => {
    try {
      const detail = await getResponse(formId, responseId);
      setSelectedResponse(detail);
    } catch {
      showToast("Couldn't load that response", "error");
    }
  };

  if (notFound) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-2 text-center">
        <p className="text-lg font-semibold text-ink">Form not found</p>
        <p className="text-sm text-ink-soft">Redirecting to your dashboard…</p>
      </div>
    );
  }

  if (!form || !summary || !responses) {
    return <div className="flex h-screen items-center justify-center text-ink-soft">Loading…</div>;
  }

  const accentColor = form.theme.accent_color || "#262626";
  const completedCount = responses.filter((r) => r.is_complete).length;
  const completionRate = responses.length > 0 ? Math.round((completedCount / responses.length) * 100) : null;

  return (
    <div className="min-h-screen bg-paper-soft/40">
      <header className="flex h-16 items-center justify-between border-b border-line bg-white px-4">
        <div className="flex items-center gap-3">
          <Link href={`/forms/${formId}/edit`} aria-label="Back to editor" className="rounded-full p-2 text-ink-soft hover:bg-paper-soft hover:text-ink">
            ←
          </Link>
          <h1 className="text-sm font-semibold text-ink">{form.title} · Responses</h1>
        </div>
        <a href={exportResponsesUrl(formId)}>
          <Button variant="secondary">Export CSV</Button>
        </a>
      </header>

      <div className="mx-auto max-w-4xl px-6 py-10">
        <div className="mb-10 flex gap-8">
          <div>
            <p className="text-3xl font-bold text-ink">{responses.length}</p>
            <p className="text-sm text-ink-soft">Total responses</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-ink">{completedCount}</p>
            <p className="text-sm text-ink-soft">Completed</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-ink">{completionRate === null ? "—" : `${completionRate}%`}</p>
            <p className="text-sm text-ink-soft">Completion rate</p>
          </div>
        </div>

        <CompletionFunnel
          questions={form.questions}
          summary={summary}
          totalResponses={responses.length}
          accentColor={accentColor}
        />

        {summary.length > 0 && (
          <div className="mb-12">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-soft">Summary</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {summary.map((s) => (
                <QuestionSummaryCard key={s.question_id} summary={s} accentColor={accentColor} />
              ))}
            </div>
          </div>
        )}

        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-soft">All responses</h2>
        {responses.length === 0 ? (
          <p className="text-sm text-ink-soft">No responses yet — share your form&apos;s link to start collecting some.</p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-line bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-line bg-paper-soft/60 text-xs uppercase tracking-wide text-ink-soft">
                <tr>
                  <th className="px-4 py-2.5 font-semibold">Submitted</th>
                  <th className="px-4 py-2.5 font-semibold">Status</th>
                  <th className="px-4 py-2.5 font-semibold">Answers</th>
                  <th className="px-4 py-2.5" />
                </tr>
              </thead>
              <tbody>
                {responses.map((r) => (
                  <tr key={r.id} className="border-b border-line last:border-0 hover:bg-paper-soft/40">
                    <td className="px-4 py-2.5 text-ink">{formatDateTime(r.submitted_at)}</td>
                    <td className="px-4 py-2.5">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                          r.is_complete ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {r.is_complete ? "Complete" : "Partial"}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-ink-soft">{r.answer_count}</td>
                    <td className="px-4 py-2.5 text-right">
                      <button onClick={() => openResponse(r.id)} className="text-xs font-semibold text-ink underline">
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ResponseDetailModal
        response={selectedResponse}
        questions={form.questions}
        onClose={() => setSelectedResponse(null)}
      />
    </div>
  );
}
