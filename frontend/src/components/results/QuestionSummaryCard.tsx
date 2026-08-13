import type { QuestionSummary } from "@/lib/types";
import { QUESTION_TYPE_LABELS } from "@/lib/types";
import { formatAnswerValue } from "@/lib/format";

export function QuestionSummaryCard({ summary, accentColor }: { summary: QuestionSummary; accentColor: string }) {
  const counts = summary.counts;
  const maxCount = counts ? Math.max(...Object.values(counts), 1) : 0;

  return (
    <div className="rounded-xl border border-line bg-white p-5">
      <div className="mb-1 flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-ink">{summary.title}</h3>
        <span className="shrink-0 text-xs font-medium text-ink-soft">{QUESTION_TYPE_LABELS[summary.type]}</span>
      </div>
      <p className="mb-3 text-xs text-ink-soft">{summary.total_answers} response{summary.total_answers === 1 ? "" : "s"}</p>

      {counts && Object.keys(counts).length > 0 && (
        <div className="flex flex-col gap-2">
          {Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .map(([label, count]) => (
              <div key={label} className="flex items-center gap-3 text-sm">
                <span className="w-28 shrink-0 truncate text-ink-soft">{formatAnswerValue(label, summary.type)}</span>
                <div className="h-2 flex-1 rounded-full bg-paper-soft">
                  <div
                    className="h-2 rounded-full"
                    style={{ width: `${(count / maxCount) * 100}%`, backgroundColor: accentColor }}
                  />
                </div>
                <span className="w-6 shrink-0 text-right font-medium text-ink">{count}</span>
              </div>
            ))}
        </div>
      )}

      {summary.average !== null && (
        <p className="text-2xl font-bold text-ink">
          {summary.average}
          <span className="ml-1 text-sm font-normal text-ink-soft">average</span>
        </p>
      )}

      {!counts && summary.average === null && (
        <p className="text-xs text-ink-soft/70">Open-ended answers — see individual responses below.</p>
      )}
    </div>
  );
}
