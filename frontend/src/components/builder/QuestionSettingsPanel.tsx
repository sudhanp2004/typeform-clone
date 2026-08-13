"use client";

import type { Question, QuestionOptions, QuestionType } from "@/lib/types";
import { Toggle } from "@/components/ui/Toggle";
import { QUESTION_TYPE_META, QUESTION_TYPE_ORDER } from "./questionTypes";
import { BranchingEditor } from "./BranchingEditor";

interface QuestionSettingsPanelProps {
  question: Question;
  allQuestions: Question[];
  onChangeType: (type: QuestionType) => void;
  onToggleRequired: () => void;
  onChangeOptions: (patch: Partial<QuestionOptions>) => void;
  onChangeBranching: (branchingRules: Question["branching_rules"]) => void;
}

const SUPPORTS_MAX_LENGTH = new Set<QuestionType>(["short_text", "long_text"]);
const SUPPORTS_VALIDATION = new Set<QuestionType>(["short_text", "long_text", "number"]);
const SUPPORTS_PLACEHOLDER = new Set<QuestionType>(["short_text", "long_text", "number", "email"]);

const ANSWER_FORMAT_LABELS: Record<NonNullable<QuestionOptions["answer_format"]>, string> = {
  letters: "Letters only",
  numbers: "Numbers only",
  alphanumeric: "Letters and numbers",
};

export function QuestionSettingsPanel({
  question,
  allQuestions,
  onChangeType,
  onToggleRequired,
  onChangeOptions,
  onChangeBranching,
}: QuestionSettingsPanelProps) {
  const { options } = question;

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

        {SUPPORTS_MAX_LENGTH.has(question.type) && (
          <div>
            <SettingRow label="Max characters">
              <Toggle
                checked={options.max_length != null}
                onChange={() => onChangeOptions({ max_length: options.max_length != null ? null : 100 })}
              />
            </SettingRow>
            {options.max_length != null && (
              <input
                type="number"
                min={1}
                value={options.max_length}
                onChange={(e) => onChangeOptions({ max_length: Math.max(1, Number(e.target.value) || 1) })}
                className="mt-2 w-24 rounded-lg border border-line px-2.5 py-1.5 text-sm"
              />
            )}
          </div>
        )}

        {SUPPORTS_VALIDATION.has(question.type) && (
          <div>
            <SettingRow label="Answer validation">
              <Toggle
                checked={hasValidation(question.type, options)}
                onChange={() => onChangeOptions(toggleValidation(question.type, options))}
              />
            </SettingRow>
            {hasValidation(question.type, options) &&
              (question.type === "number" ? (
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={options.min_value ?? ""}
                    onChange={(e) => onChangeOptions({ min_value: e.target.value === "" ? null : Number(e.target.value) })}
                    className="w-full min-w-0 rounded-lg border border-line px-2.5 py-1.5 text-sm"
                  />
                  <span className="text-ink-soft">–</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={options.max_value ?? ""}
                    onChange={(e) => onChangeOptions({ max_value: e.target.value === "" ? null : Number(e.target.value) })}
                    className="w-full min-w-0 rounded-lg border border-line px-2.5 py-1.5 text-sm"
                  />
                </div>
              ) : (
                <select
                  value={options.answer_format ?? "letters"}
                  onChange={(e) => onChangeOptions({ answer_format: e.target.value as QuestionOptions["answer_format"] })}
                  className="mt-2 w-full rounded-lg border border-line px-2.5 py-1.5 text-sm"
                >
                  {(Object.keys(ANSWER_FORMAT_LABELS) as (keyof typeof ANSWER_FORMAT_LABELS)[]).map((format) => (
                    <option key={format} value={format}>
                      {ANSWER_FORMAT_LABELS[format]}
                    </option>
                  ))}
                </select>
              ))}
          </div>
        )}

        {SUPPORTS_PLACEHOLDER.has(question.type) && (
          <div>
            <SettingRow label="Custom placeholder text">
              <Toggle
                checked={options.placeholder != null}
                onChange={() => onChangeOptions({ placeholder: options.placeholder != null ? null : "" })}
              />
            </SettingRow>
            {options.placeholder != null && (
              <input
                type="text"
                value={options.placeholder}
                onChange={(e) => onChangeOptions({ placeholder: e.target.value })}
                placeholder="Type your answer here…"
                className="mt-2 w-full rounded-lg border border-line px-2.5 py-1.5 text-sm"
              />
            )}
          </div>
        )}

        <SettingRow label="Map to contacts" comingSoon>
          <Toggle checked={false} disabled />
        </SettingRow>
      </div>

      <div className="flex items-center justify-between border-t border-line pt-4">
        <span className="text-sm font-medium text-ink-soft/50">Image or video</span>
        <button
          disabled
          title="Coming soon"
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-line text-ink-soft/40"
        >
          +
        </button>
      </div>

      <div className="border-t border-line pt-4">
        <h3 className="mb-3 text-sm font-semibold text-ink">Branching</h3>
        <BranchingEditor question={question} allQuestions={allQuestions} onUpdate={onChangeBranching} />
      </div>

      <div className="flex items-center justify-between border-t border-line pt-4">
        <span className="text-sm font-medium text-ink-soft/50">Comments</span>
        <span
          title="Coming soon"
          className="rounded-full bg-paper-soft px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ink-soft/60"
        >
          Soon
        </span>
      </div>
    </div>
  );
}

function hasValidation(type: QuestionType, options: QuestionOptions): boolean {
  return type === "number" ? options.min_value != null || options.max_value != null : options.answer_format != null;
}

function toggleValidation(type: QuestionType, options: QuestionOptions): Partial<QuestionOptions> {
  const isOn = hasValidation(type, options);
  if (type === "number") {
    return isOn ? { min_value: null, max_value: null } : { min_value: 0 };
  }
  return isOn ? { answer_format: null } : { answer_format: "letters" };
}

function SettingRow({ label, comingSoon, children }: { label: string; comingSoon?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className={`text-sm font-medium ${comingSoon ? "text-ink-soft/50" : "text-ink-soft"}`}>{label}</span>
      {children}
    </div>
  );
}
