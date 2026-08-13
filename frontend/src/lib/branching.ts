import type { Question } from "./types";

/**
 * Given the question a respondent just answered, decide which question comes next.
 * Mirrors the backend's _resolve_next_question (routers/public.py) so the client-side
 * navigation and the server's authoritative required-field check never disagree.
 *
 * Returns null to mean "submit the form" (either an explicit "end" jump, or falling
 * off the end of the question list).
 */
export function resolveNextQuestion(
  current: Question,
  answer: unknown,
  questions: Question[]
): Question | null {
  for (const rule of current.branching_rules ?? []) {
    if (String(answer) === rule.value) {
      if (rule.target_question_id === "end") return null;
      const target = questions.find((q) => q.id === rule.target_question_id);
      if (target) return target;
      break; // matched rule but its target no longer exists; fall through to default
    }
  }

  const index = questions.findIndex((q) => q.id === current.id);
  return index >= 0 && index + 1 < questions.length ? questions[index + 1] : null;
}
