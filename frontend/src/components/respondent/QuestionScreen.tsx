"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import type { Question, QuestionType } from "@/lib/types";
import { AnswerField } from "./AnswerField";
import { validateAnswer } from "@/lib/validation";

interface QuestionScreenProps {
  question: Question;
  index: number;
  value: unknown;
  onChange: (value: unknown) => void;
  onAdvance: () => void;
  accentColor: string;
}

const variants = {
  enter: { opacity: 0, y: 24 },
  center: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -24 },
};

// These answer types are unambiguous the moment a value is picked, so — like
// the real Typeform — we auto-advance instead of waiting for an explicit OK.
const AUTO_ADVANCE_TYPES = new Set<QuestionType>(["multiple_choice", "dropdown", "yes_no", "rating"]);

export function QuestionScreen({ question, index, value, onChange, onAdvance, accentColor }: QuestionScreenProps) {
  const [error, setError] = useState<string | null>(null);
  const isSelectable = AUTO_ADVANCE_TYPES.has(question.type);

  const handleAdvance = () => {
    const validationError = validateAnswer(question, value);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    onAdvance();
  };

  const handleSelect = (v: unknown) => {
    onChange(v);
    setError(null);
    window.setTimeout(onAdvance, 380);
  };

  const handleTypedChange = (v: unknown) => {
    onChange(v);
    if (error) setError(null);
  };

  return (
    <motion.div
      key={question.id}
      variants={variants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-6 py-24"
    >
      <div className="mb-6 flex items-start gap-3">
        <span className="mt-1.5 text-base font-semibold" style={{ color: accentColor }}>
          {index + 1} →
        </span>
        <div>
          <h2 className="text-2xl font-bold leading-tight text-ink sm:text-3xl">
            {question.title}
            {question.required && (
              <span className="ml-1.5 align-top text-lg" style={{ color: accentColor }}>
                *
              </span>
            )}
          </h2>
          {question.description && <p className="mt-2 text-base text-ink-soft">{question.description}</p>}
        </div>
      </div>

      <div className="ml-0 sm:ml-9">
        <AnswerField
          question={question}
          value={value}
          onChange={isSelectable ? handleSelect : handleTypedChange}
          onSubmitKey={handleAdvance}
          accentColor={accentColor}
          autoFocus
        />

        {error && <p className="mt-3 text-sm font-medium text-danger">{error}</p>}

        {!isSelectable && (
          <div className="mt-8 flex items-center gap-3">
            <button
              onClick={handleAdvance}
              className="rounded-full px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: accentColor }}
            >
              OK
            </button>
            <span className="text-xs text-ink-soft">
              press <kbd className="rounded border border-line px-1.5 py-0.5">Enter ↵</kbd>
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
