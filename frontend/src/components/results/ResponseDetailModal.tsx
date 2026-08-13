import { Modal } from "@/components/ui/Modal";
import type { Question, ResponseDetail } from "@/lib/types";
import { isFileAnswer } from "@/lib/types";
import { formatAnswerValue } from "@/lib/format";
import { resolveFileUrl } from "@/lib/api";

export function ResponseDetailModal({
  response,
  questions,
  onClose,
}: {
  response: ResponseDetail | null;
  questions: Question[];
  onClose: () => void;
}) {
  const answersByQuestion = new Map(response?.answers.map((a) => [a.question_id, a.value]) ?? []);

  return (
    <Modal open={response !== null} onClose={onClose} title="Response">
      <div className="flex max-h-[60vh] flex-col gap-4 overflow-y-auto pr-1">
        {questions.map((q) => {
          const value = answersByQuestion.get(q.id);
          return (
            <div key={q.id}>
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">{q.title}</p>
              <p className="mt-0.5 text-sm text-ink">
                {value === undefined || value === null || value === "" ? (
                  <span className="text-ink-soft/60 italic">Skipped</span>
                ) : isFileAnswer(value) ? (
                  <a
                    href={resolveFileUrl(value.url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-ink underline hover:opacity-70"
                  >
                    {value.file_name}
                  </a>
                ) : (
                  formatAnswerValue(value, q.type)
                )}
              </p>
            </div>
          );
        })}
      </div>
    </Modal>
  );
}
