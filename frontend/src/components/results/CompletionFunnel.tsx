import type { Question, QuestionSummary } from "@/lib/types";

interface CompletionFunnelProps {
  questions: Question[];
  summary: QuestionSummary[];
  totalResponses: number;
  accentColor: string;
}

export function CompletionFunnel({ questions, summary, totalResponses, accentColor }: CompletionFunnelProps) {
  if (totalResponses === 0 || questions.length === 0) return null;

  const summaryByQuestion = new Map(summary.map((s) => [s.question_id, s]));
  const ordered = [...questions].sort((a, b) => a.order_index - b.order_index);

  return (
    <div className="mb-12">
      <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-ink-soft">Completion by question</h2>
      <p className="mb-3 text-xs text-ink-soft">
        Share of respondents who answered each question — where this drops sharply is where people are giving up.
      </p>
      <div className="rounded-xl border border-line bg-white p-4">
        <div className="flex flex-col gap-3">
          {ordered.map((question, i) => {
            const reached = summaryByQuestion.get(question.id)?.total_answers ?? 0;
            const rate = Math.round((reached / totalResponses) * 100);
            return (
              <div key={question.id} className="flex items-center gap-3 text-sm">
                <span className="w-5 shrink-0 text-right text-xs font-semibold text-ink-soft">{i + 1}</span>
                <span className="w-48 shrink-0 truncate text-ink" title={question.title}>
                  {question.title || "Untitled question"}
                </span>
                <div className="h-2 flex-1 rounded-full bg-paper-soft">
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{ width: `${rate}%`, backgroundColor: accentColor }}
                  />
                </div>
                <span className="w-16 shrink-0 text-right font-medium text-ink">
                  {rate}%
                  <span className="ml-1 font-normal text-ink-soft">({reached})</span>
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
