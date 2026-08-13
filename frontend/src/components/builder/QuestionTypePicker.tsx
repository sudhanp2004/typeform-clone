"use client";

import type { QuestionType } from "@/lib/types";
import { Modal } from "@/components/ui/Modal";
import { QUESTION_TYPE_META, QUESTION_TYPE_ORDER } from "./questionTypes";

const COMING_SOON = ["Payment"];

export function QuestionTypePicker({
  open,
  onClose,
  onPick,
}: {
  open: boolean;
  onClose: () => void;
  onPick: (type: QuestionType) => void;
}) {
  return (
    <Modal open={open} onClose={onClose} title="Add a question">
      <div className="grid grid-cols-2 gap-2">
        {QUESTION_TYPE_ORDER.map((type) => (
          <button
            key={type}
            onClick={() => onPick(type)}
            className="flex items-center gap-2.5 rounded-lg border border-line px-3 py-2.5 text-left text-sm font-medium hover:border-ink"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-paper-soft text-xs font-bold text-ink-soft">
              {QUESTION_TYPE_META[type].icon}
            </span>
            {QUESTION_TYPE_META[type].label}
          </button>
        ))}
        {COMING_SOON.map((label) => (
          <div
            key={label}
            className="flex items-center justify-between gap-2.5 rounded-lg border border-line/60 px-3 py-2.5 text-left text-sm font-medium text-ink-soft/50"
          >
            {label}
            <span className="rounded-full bg-paper-soft px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
              Soon
            </span>
          </div>
        ))}
      </div>
    </Modal>
  );
}
