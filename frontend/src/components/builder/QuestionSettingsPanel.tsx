"use client";

import { useState } from "react";
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

/** Collapsible accordion card that mirrors the Typeform settings panel layout */
function AccordionCard({
  title,
  titleIcon,
  defaultOpen = true,
  headerRight,
  children,
}: {
  title: string;
  titleIcon?: React.ReactNode;
  defaultOpen?: boolean;
  headerRight?: React.ReactNode;
  children?: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-2xl border border-line bg-white shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-4 py-3.5 text-left"
      >
        <span className="flex items-center gap-1.5 text-[13px] font-semibold text-ink">
          {title}
          {titleIcon}
        </span>
        {headerRight ?? (
          <span
            className={`flex h-6 w-6 items-center justify-center rounded-lg border border-line text-sm text-ink-soft transition-colors hover:bg-paper-soft ${open ? "rotate-0" : ""}`}
            aria-hidden
          >
            {open ? "−" : "+"}
          </span>
        )}
      </button>

      {open && children && (
        <div className="border-t border-line px-4 pb-4 pt-3">
          {children}
        </div>
      )}
    </div>
  );
}

function SettingRow({
  label,
  hint,
  comingSoon,
  children,
}: {
  label: string;
  hint?: string;
  comingSoon?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5 border-b border-line/60 last:border-0">
      <span className={`flex items-center gap-1 text-[13px] font-medium ${comingSoon ? "text-ink-soft/40" : "text-ink-soft"}`}>
        {label}
        {hint && (
          <span
            className="flex h-3.5 w-3.5 items-center justify-center rounded-full border border-ink-soft/30 text-[9px] text-ink-soft/50"
            title={hint}
          >
            ?
          </span>
        )}
      </span>
      {children}
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
    <div className="flex h-full flex-col gap-2.5 overflow-y-auto bg-[#f0f0ef] px-3 py-3 border-l border-line">

      {/* ── Question card ─────────────────────────────────── */}
      <AccordionCard
        title="Question"
        titleIcon={
          <span
            className="flex h-3.5 w-3.5 items-center justify-center rounded-full border border-ink-soft/30 text-[9px] text-ink-soft/50"
            title="How this question is presented to respondents"
          >
            ?
          </span>
        }
      >
        {/* Text / Video segmented control */}
        <div className="flex rounded-xl bg-paper-soft p-1">
          <button className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-[13px] font-semibold text-ink shadow-sm">
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" className="shrink-0">
              <rect x="1" y="4" width="14" height="2" rx="1" fill="currentColor" />
              <rect x="1" y="8" width="10" height="2" rx="1" fill="currentColor" />
              <rect x="1" y="12" width="12" height="2" rx="1" fill="currentColor" />
            </svg>
            Text
          </button>
          <button
            disabled
            title="Coming soon"
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-medium text-ink-soft/30 cursor-not-allowed"
          >
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" className="shrink-0">
              <rect x="1" y="3" width="10" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M12 7l3-2v6l-3-2V7z" fill="currentColor" />
            </svg>
            Video
          </button>
        </div>
      </AccordionCard>

      {/* ── Answer card ───────────────────────────────────── */}
      <AccordionCard title="Answer">
        {/* Type dropdown with icon */}
        <div className="mb-1">
          <div className="flex items-center gap-2 rounded-xl border border-line bg-white px-3 py-2.5 shadow-sm">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-100 text-xs font-bold text-blue-600 shrink-0">
              {QUESTION_TYPE_META[question.type]?.icon ?? "Aa"}
            </span>
            <select
              value={question.type}
              onChange={(e) => onChangeType(e.target.value as QuestionType)}
              className="flex-1 bg-transparent text-[13px] font-medium text-ink focus:outline-none cursor-pointer"
            >
              {QUESTION_TYPE_ORDER.map((type) => (
                <option key={type} value={type}>
                  {QUESTION_TYPE_META[type].label}
                </option>
              ))}
            </select>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="shrink-0 text-ink-soft/50 pointer-events-none">
              <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        {/* Settings rows */}
        <div className="mt-3 flex flex-col">
          <SettingRow label="Required">
            <Toggle checked={question.required} onChange={onToggleRequired} />
          </SettingRow>

          {SUPPORTS_MAX_LENGTH.has(question.type) && (
            <>
              <SettingRow label="Max characters">
                <Toggle
                  checked={options.max_length != null}
                  onChange={() => onChangeOptions({ max_length: options.max_length != null ? null : 100 })}
                />
              </SettingRow>
              {options.max_length != null && (
                <div className="pb-2.5">
                  <input
                    type="number"
                    min={1}
                    value={options.max_length}
                    onChange={(e) => onChangeOptions({ max_length: Math.max(1, Number(e.target.value) || 1) })}
                    className="w-24 rounded-lg border border-line bg-white px-2.5 py-1.5 text-sm text-ink"
                  />
                </div>
              )}
            </>
          )}

          {SUPPORTS_VALIDATION.has(question.type) && (
            <>
              <SettingRow label="Answer validation" hint="Restrict accepted values">
                <Toggle
                  checked={hasValidation(question.type, options)}
                  onChange={() => onChangeOptions(toggleValidation(question.type, options))}
                />
              </SettingRow>
              {hasValidation(question.type, options) &&
                (question.type === "number" ? (
                  <div className="flex items-center gap-2 pb-2.5">
                    <input
                      type="number"
                      placeholder="Min"
                      value={options.min_value ?? ""}
                      onChange={(e) => onChangeOptions({ min_value: e.target.value === "" ? null : Number(e.target.value) })}
                      className="w-full min-w-0 rounded-lg border border-line bg-white px-2.5 py-1.5 text-sm text-ink"
                    />
                    <span className="text-ink-soft">–</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={options.max_value ?? ""}
                      onChange={(e) => onChangeOptions({ max_value: e.target.value === "" ? null : Number(e.target.value) })}
                      className="w-full min-w-0 rounded-lg border border-line bg-white px-2.5 py-1.5 text-sm text-ink"
                    />
                  </div>
                ) : (
                  <div className="pb-2.5">
                    <select
                      value={options.answer_format ?? "letters"}
                      onChange={(e) => onChangeOptions({ answer_format: e.target.value as QuestionOptions["answer_format"] })}
                      className="w-full rounded-lg border border-line bg-white px-2.5 py-1.5 text-sm text-ink"
                    >
                      {(Object.keys(ANSWER_FORMAT_LABELS) as (keyof typeof ANSWER_FORMAT_LABELS)[]).map((format) => (
                        <option key={format} value={format}>
                          {ANSWER_FORMAT_LABELS[format]}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
            </>
          )}

          {SUPPORTS_PLACEHOLDER.has(question.type) && (
            <>
              <SettingRow label="Custom placeholder text" hint="Override the default placeholder">
                <Toggle
                  checked={options.placeholder != null}
                  onChange={() => onChangeOptions({ placeholder: options.placeholder != null ? null : "" })}
                />
              </SettingRow>
              {options.placeholder != null && (
                <div className="pb-2.5">
                  <input
                    type="text"
                    value={options.placeholder}
                    onChange={(e) => onChangeOptions({ placeholder: e.target.value })}
                    placeholder="Type your answer here…"
                    className="w-full rounded-lg border border-line bg-white px-2.5 py-1.5 text-sm text-ink"
                  />
                </div>
              )}
            </>
          )}

          <SettingRow label="Map to contacts" hint="Link this answer to a contact field" comingSoon>
            <Toggle checked={false} disabled />
          </SettingRow>
        </div>
      </AccordionCard>

      {/* ── Image or video card ───────────────────────────── */}
      <AccordionCard
        title="Image or video"
        defaultOpen={false}
        headerRight={
          <button
            disabled
            title="Coming soon"
            className="flex h-6 w-6 items-center justify-center rounded-lg border border-line text-sm text-ink-soft/40 cursor-not-allowed hover:bg-paper-soft"
          >
            +
          </button>
        }
      >
        <p className="text-xs text-ink-soft/50">Coming soon</p>
      </AccordionCard>

      {/* ── Branching card ────────────────────────────────── */}
      <AccordionCard
        title="Branching"
        defaultOpen={false}
        headerRight={
          <span
            className="flex h-6 w-6 items-center justify-center rounded-lg border border-line text-sm text-ink-soft pointer-events-none"
            aria-hidden
          >
            +
          </span>
        }
      >
        <BranchingEditor question={question} allQuestions={allQuestions} onUpdate={onChangeBranching} />
      </AccordionCard>

      {/* ── Comments card ─────────────────────────────────── */}
      <AccordionCard
        title="Comments"
        defaultOpen={false}
        headerRight={
          <span className="flex h-5 items-center justify-center rounded-full bg-emerald-50 px-2 text-[10px] font-semibold text-emerald-600">
            PRO
          </span>
        }
      >
        <p className="text-xs text-ink-soft/50">Upgrade to collect comments on this question.</p>
      </AccordionCard>
    </div>
  );
}
