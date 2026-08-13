"use client";

import { useState } from "react";
import type { Question } from "@/lib/types";
import { Textarea } from "@/components/ui/Input";
import { ChoicesEditor } from "./ChoicesEditor";
import { QUESTION_TYPE_META } from "./questionTypes";
import type { QuestionInput } from "@/lib/api";

interface EditorCanvasProps {
  question: Question;
  accentColor: string;
  onUpdate: (patch: Partial<QuestionInput>) => void;
}

export function EditorCanvas({ question, accentColor, onUpdate }: EditorCanvasProps) {
  const [title, setTitle] = useState(question.title);
  const [description, setDescription] = useState(question.description ?? "");
  const meta = QUESTION_TYPE_META[question.type];

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-8 py-16">
      <div className="mb-5 flex h-6 w-6 items-center justify-center rounded bg-ink text-xs font-bold text-white">
        {meta.icon}
      </div>

      <Textarea
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={() => onUpdate({ title })}
        placeholder={meta.defaultTitle}
        rows={2}
        className="!border-0 !border-b-2 !border-ink/10 !px-0 !py-2 text-2xl font-bold leading-snug !shadow-none focus:!border-ink sm:text-3xl"
      />

      <Textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        onBlur={() => onUpdate({ description: description || null })}
        placeholder="Description (optional)"
        rows={1}
        className="mt-3 !border-0 !px-0 !py-1 text-base italic text-ink-soft !shadow-none"
      />

      <div className="mt-8">
        {(question.type === "multiple_choice" || question.type === "dropdown") && (
          <ChoicesEditor
            choices={question.options.choices ?? []}
            onChange={(choices) => onUpdate({ options: { ...question.options, choices } })}
          />
        )}

        {question.type === "rating" && (
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-ink-soft">Max rating</span>
            <select
              value={question.options.max_rating ?? 5}
              onChange={(e) => onUpdate({ options: { ...question.options, max_rating: Number(e.target.value) } })}
              className="rounded-lg border border-line px-2.5 py-1.5 text-sm"
            >
              {[3, 5, 7, 10].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <div className="flex gap-1">
              {Array.from({ length: question.options.max_rating ?? 5 }, (_, i) => (
                <span
                  key={i}
                  className="flex h-8 w-8 items-center justify-center rounded-md text-sm font-semibold text-white"
                  style={{ backgroundColor: accentColor }}
                >
                  {i + 1}
                </span>
              ))}
            </div>
          </div>
        )}

        {(question.type === "short_text" || question.type === "email" || question.type === "number") && (
          <div className="w-full max-w-sm border-b-2 border-ink/10 pb-3 text-lg text-ink/30">
            {question.type === "email" ? "name@example.com" : question.type === "number" ? "0" : "Type your answer here…"}
          </div>
        )}

        {question.type === "long_text" && (
          <div className="w-full border-b-2 border-ink/10 pb-3 text-lg text-ink/30">Type your answer here…</div>
        )}

        {question.type === "yes_no" && (
          <div className="flex gap-3">
            {["Yes", "No"].map((opt) => (
              <div key={opt} className="rounded-xl border-2 border-ink/10 px-4 py-3 text-base font-semibold text-ink/40">
                {opt}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
