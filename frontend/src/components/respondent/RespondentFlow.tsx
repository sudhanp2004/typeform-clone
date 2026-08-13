"use client";

import { AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import type { PublicForm } from "@/lib/types";
import { resolveNextQuestion } from "@/lib/branching";
import { resolveFontFamily } from "@/lib/fonts";
import { ProgressBar } from "./ProgressBar";
import { WelcomeScreen } from "./WelcomeScreen";
import { QuestionScreen } from "./QuestionScreen";
import { ThankYouScreen } from "./ThankYouScreen";

type Stage = "welcome" | "question" | "done";

interface RespondentFlowProps {
  form: PublicForm;
  onComplete?: (answers: Record<string, unknown>) => Promise<void> | void;
  previewMode?: boolean;
}

export function RespondentFlow({ form, onComplete, previewMode }: RespondentFlowProps) {
  const [stage, setStage] = useState<Stage>("welcome");
  const [currentId, setCurrentId] = useState<string | null>(form.questions[0]?.id ?? null);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [submitting, setSubmitting] = useState(false);

  const accentColor = form.theme.accent_color || "#262626";
  const question = form.questions.find((q) => q.id === currentId) ?? null;

  // Branching means "next" isn't always "index + 1", and a respondent can jump
  // backward to a question that isn't literally the previous one in the list —
  // so we track where they've actually been, not just a position.
  const historyRef = useRef<string[]>([]);
  const currentIdRef = useRef<string | null>(currentId);

  // Selectable answer types (multiple choice, yes/no, rating) auto-advance via
  // a short setTimeout so the selection is visible before the transition. If
  // that timer's onAdvance closure read `answers`/`currentId` state directly, it
  // could fire with a stale snapshot from before the just-picked value landed
  // (React state updates aren't synchronous). Refs sidestep that: they're
  // mutated the instant the value is chosen, so even a stale-closured advance
  // call always reads the true current answers/question.
  const answersRef = useRef<Record<string, unknown>>({});

  const setAnswer = (questionId: string, value: unknown) => {
    setAnswers((a) => {
      const next = { ...a, [questionId]: value };
      answersRef.current = next;
      return next;
    });
  };

  const goNext = async () => {
    const current = form.questions.find((q) => q.id === currentIdRef.current);
    if (!current) return;

    const next = resolveNextQuestion(current, answersRef.current[current.id], form.questions);
    historyRef.current.push(current.id);

    if (next) {
      currentIdRef.current = next.id;
      setCurrentId(next.id);
      return;
    }

    setSubmitting(true);
    try {
      await onComplete?.(answersRef.current);
      setStage("done");
    } finally {
      setSubmitting(false);
    }
  };

  const goPrev = () => {
    const previousId = historyRef.current.pop();
    if (previousId) {
      currentIdRef.current = previousId;
      setCurrentId(previousId);
    }
  };

  useEffect(() => {
    if (stage !== "question") return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp") {
        e.preventDefault();
        goPrev();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [stage]);

  if (form.questions.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center px-6 text-center text-ink-soft">
        This form doesn&apos;t have any questions yet.
      </div>
    );
  }

  return (
    <div
      className="relative flex min-h-screen flex-1 flex-col bg-paper"
      style={{
        backgroundColor: form.theme.background || undefined,
        fontFamily: resolveFontFamily(form.theme.font),
      }}
    >
      {stage === "question" && question && (
        <ProgressBar progress={(question.order_index + 1) / form.questions.length} accentColor={accentColor} />
      )}

      <AnimatePresence mode="wait">
        {stage === "welcome" && (
          <WelcomeScreen
            key="welcome"
            title={form.welcome_screen.title || form.title}
            subtitle={form.welcome_screen.subtitle}
            accentColor={accentColor}
            questionCount={form.questions.length}
            onStart={() => setStage("question")}
          />
        )}

        {stage === "question" && question && (
          <QuestionScreen
            key={question.id}
            question={question}
            index={question.order_index}
            value={answers[question.id]}
            onChange={(v) => setAnswer(question.id, v)}
            onAdvance={goNext}
            accentColor={accentColor}
          />
        )}

        {stage === "done" && (
          <ThankYouScreen
            key="done"
            title={form.thank_you_screen.title || "Thanks for completing this form!"}
            subtitle={form.thank_you_screen.subtitle}
            accentColor={accentColor}
          />
        )}
      </AnimatePresence>

      {submitting && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-white/60 text-sm font-medium text-ink-soft">
          Submitting…
        </div>
      )}

      {previewMode && (
        <div className="fixed bottom-4 left-1/2 z-30 -translate-x-1/2 rounded-full bg-ink px-4 py-1.5 text-xs font-semibold text-white shadow-lg">
          Preview mode — responses aren&apos;t saved
        </div>
      )}
    </div>
  );
}
