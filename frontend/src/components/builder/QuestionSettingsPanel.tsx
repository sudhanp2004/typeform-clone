"use client";

import type { Question, QuestionType } from "@/lib/types";
import { Toggle } from "@/components/ui/Toggle";
import { QUESTION_TYPE_META, QUESTION_TYPE_ORDER } from "./questionTypes";
import { BranchingEditor } from "./BranchingEditor";

interface QuestionSettingsPanelProps {
  question: Question;
  allQuestions: Question[];
  onChangeType: (type: QuestionType) => void;
  onToggleRequired: () => void;
  onChangeBranching: (branchingRules: Question["branching_rules"]) => void;
}

const COMING_SOON_TOGGLES = ["Answer validation", "Custom placeholder text", "Map to contacts"];

export function QuestionSettingsPanel({
  question,
  allQuestions,
  onChangeType,
  onToggleRequired,
  onChangeBranching,
}: QuestionSettingsPanelProps) {
  return (
    <div className="flex h-full flex-col gap-6 overflow-y-auto border-l border-line bg-white p-5">
      <div>
        <h3 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-ink">
          Question
          <span
            className="flex h-3.5 w-3.5 items-center justify-center rounded-full border border-ink-soft/40 text-[9px] text-ink-soft/70"
            title="How this question is presented to respondents"
          >
            ?
          </span>
        </h3>
        <div className="flex rounded-lg bg-paper-soft p-1">
          <button className="flex-1 rounded-md bg-white px-3 py-1.5 text-sm font-semibold text-ink shadow-sm">
            Text
          </button>
          <button
            disabled
            title="Coming soon"
            className="flex-1 rounded-md px-3 py-1.5 text-sm font-medium text-ink-soft/40"
          >
            Video
          </button>
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-ink">Answer</h3>
        <select
          value={question.type}
          onChange={(e) => onChangeType(e.target.value as QuestionType)}
          className="w-full rounded-lg border border-line px-3 py-2 text-sm font-medium text-ink"
        >
          {QUESTION_TYPE_ORDER.map((type) => (
            <option key={type} value={type}>
              {QUESTION_TYPE_META[type].label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-4">
        <SettingRow label="Required">
          <Toggle checked={question.required} onChange={onToggleRequired} />
        </SettingRow>

        {COMING_SOON_TOGGLES.map((label) => (
          <SettingRow key={label} label={label} comingSoon>
            <Toggle checked={false} disabled />
          </SettingRow>
        ))}
      </div>

      <div className="border-t border-line pt-4">
        <h3 className="mb-3 text-sm font-semibold text-ink">Branching</h3>
        <BranchingEditor question={question} allQuestions={allQuestions} onUpdate={onChangeBranching} />
      </div>
    </div>
  );
}

function SettingRow({ label, comingSoon, children }: { label: string; comingSoon?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className={`text-sm font-medium ${comingSoon ? "text-ink-soft/50" : "text-ink-soft"}`}>{label}</span>
      {children}
    </div>
  );
}
