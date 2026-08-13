"use client";

import { Input } from "@/components/ui/Input";

export function ChoicesEditor({
  choices,
  onChange,
}: {
  choices: string[];
  onChange: (choices: string[]) => void;
}) {
  const updateChoice = (index: number, value: string) => {
    const next = [...choices];
    next[index] = value;
    onChange(next);
  };

  const removeChoice = (index: number) => {
    onChange(choices.filter((_, i) => i !== index));
  };

  const addChoice = () => {
    onChange([...choices, `Option ${choices.length + 1}`]);
  };

  return (
    <div className="flex flex-col gap-2">
      {choices.map((choice, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-line text-xs font-bold text-ink-soft">
            {String.fromCharCode(65 + i)}
          </span>
          <Input value={choice} onChange={(e) => updateChoice(i, e.target.value)} />
          <button
            onClick={() => removeChoice(i)}
            disabled={choices.length <= 2}
            aria-label="Remove option"
            className="shrink-0 rounded px-2 py-1 text-ink-soft hover:bg-danger/10 hover:text-danger disabled:opacity-30"
          >
            ✕
          </button>
        </div>
      ))}
      <button onClick={addChoice} className="mt-1 self-start text-sm font-semibold text-ink-soft hover:text-ink">
        + Add option
      </button>
    </div>
  );
}
