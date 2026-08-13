"use client";

import type { Question } from "@/lib/types";

interface AnswerFieldProps {
  question: Question;
  value: unknown;
  onChange: (value: unknown) => void;
  onSubmitKey: () => void;
  accentColor: string;
  autoFocus?: boolean;
}

export function AnswerField({ question, value, onChange, onSubmitKey, accentColor, autoFocus }: AnswerFieldProps) {
  const handleEnter = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmitKey();
    }
  };

  switch (question.type) {
    case "short_text":
    case "email":
    case "number":
      return (
        <input
          autoFocus={autoFocus}
          type={question.type === "number" ? "text" : question.type === "email" ? "email" : "text"}
          inputMode={question.type === "number" ? "decimal" : undefined}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleEnter}
          placeholder="Type your answer here…"
          className="w-full border-b-2 border-ink/15 bg-transparent pb-3 text-2xl font-medium text-ink placeholder:text-ink/25 focus:outline-none sm:text-3xl"
          style={{ borderColor: value ? accentColor : undefined }}
        />
      );

    case "long_text":
      return (
        <textarea
          autoFocus={autoFocus}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            // Plain Enter inserts a newline (textarea default); Cmd/Ctrl+Enter advances.
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              onSubmitKey();
            }
          }}
          placeholder="Type your answer here… (Cmd/Ctrl + Enter to continue)"
          rows={3}
          className="w-full border-b-2 border-ink/15 bg-transparent pb-3 text-xl font-medium text-ink placeholder:text-ink/25 focus:outline-none sm:text-2xl"
        />
      );

    case "multiple_choice":
    case "dropdown":
      return (
        <div className="flex flex-col gap-3">
          {(question.options.choices ?? []).map((choice, i) => {
            const selected = value === choice;
            return (
              <button
                key={choice}
                type="button"
                onClick={() => onChange(choice)}
                className="group flex items-center gap-3 rounded-xl border-2 px-4 py-3.5 text-left text-lg font-medium transition-colors"
                style={{
                  borderColor: selected ? accentColor : "rgba(10,10,10,0.12)",
                  backgroundColor: selected ? `${accentColor}0f` : "transparent",
                }}
              >
                <span
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border-2 text-xs font-bold uppercase"
                  style={{ borderColor: selected ? accentColor : "rgba(10,10,10,0.2)", color: selected ? accentColor : "#6b6b6b" }}
                >
                  {String.fromCharCode(65 + i)}
                </span>
                {choice}
              </button>
            );
          })}
        </div>
      );

    case "yes_no":
      return (
        <div className="flex gap-3">
          {["Yes", "No"].map((opt) => {
            const boolValue = opt === "Yes" ? "true" : "false";
            const selected = value === boolValue;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => onChange(boolValue)}
                className="flex-1 rounded-xl border-2 px-4 py-4 text-lg font-semibold transition-colors"
                style={{
                  borderColor: selected ? accentColor : "rgba(10,10,10,0.12)",
                  backgroundColor: selected ? `${accentColor}0f` : "transparent",
                  color: selected ? accentColor : "var(--ink)",
                }}
              >
                {opt}
              </button>
            );
          })}
        </div>
      );

    case "rating": {
      const max = question.options.max_rating ?? 5;
      const current = Number(value) || 0;
      return (
        <div className="flex gap-2">
          {Array.from({ length: max }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => onChange(n)}
              aria-label={`Rate ${n} out of ${max}`}
              className="flex h-12 w-12 items-center justify-center rounded-lg border-2 text-lg font-semibold transition-colors sm:h-14 sm:w-14"
              style={{
                borderColor: n <= current ? accentColor : "rgba(10,10,10,0.15)",
                backgroundColor: n <= current ? accentColor : "transparent",
                color: n <= current ? "#ffffff" : "var(--ink)",
              }}
            >
              {n}
            </button>
          ))}
        </div>
      );
    }

    default:
      return null;
  }
}
