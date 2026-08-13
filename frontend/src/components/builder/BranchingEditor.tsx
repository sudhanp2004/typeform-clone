"use client";

import { BRANCHABLE_QUESTION_TYPES, type Question } from "@/lib/types";

interface BranchingEditorProps {
  question: Question;
  allQuestions: Question[];
  onUpdate: (branchingRules: Question["branching_rules"]) => void;
}

function branchableValues(question: Question): string[] {
  if (question.type === "yes_no") return ["true", "false"];
  if (question.type === "multiple_choice" || question.type === "dropdown") {
    return question.options.choices ?? [];
  }
  return [];
}

function valueLabel(question: Question, value: string): string {
  if (question.type === "yes_no") return value === "true" ? "Yes" : "No";
  return value;
}

export function BranchingEditor({ question, allQuestions, onUpdate }: BranchingEditorProps) {
  if (!BRANCHABLE_QUESTION_TYPES.has(question.type)) {
    return (
      <p className="text-xs leading-relaxed text-ink-soft/60">
        Branching is only available for Multiple choice, Dropdown, and Yes/No questions.
      </p>
    );
  }

  const values = branchableValues(question);
  if (values.length === 0) {
    return <p className="text-xs leading-relaxed text-ink-soft/60">Add answer options to set up branching.</p>;
  }

  const targets = allQuestions.filter((q) => q.id !== question.id);

  const setRule = (value: string, targetQuestionId: string) => {
    const withoutThisValue = question.branching_rules.filter((r) => r.value !== value);
    const next = targetQuestionId ? [...withoutThisValue, { value, target_question_id: targetQuestionId }] : withoutThisValue;
    onUpdate(next);
  };

  return (
    <div className="flex flex-col gap-2.5">
      {values.map((value) => {
        const currentTarget = question.branching_rules.find((r) => r.value === value)?.target_question_id ?? "";
        return (
          <div key={value} className="flex flex-col gap-1">
            <span className="text-xs text-ink-soft">
              If answer is &ldquo;{valueLabel(question, value)}&rdquo;
            </span>
            <select
              value={currentTarget}
              onChange={(e) => setRule(value, e.target.value)}
              className="w-full rounded-md border border-line px-2 py-1.5 text-xs text-ink"
            >
              <option value="">Go to next question</option>
              {targets.map((t) => (
                <option key={t.id} value={t.id}>
                  Jump to {t.order_index + 1}. {t.title || "Untitled question"}
                </option>
              ))}
              <option value="end">End of form</option>
            </select>
          </div>
        );
      })}
    </div>
  );
}
