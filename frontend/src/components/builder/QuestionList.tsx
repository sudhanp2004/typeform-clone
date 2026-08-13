"use client";

import {
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";
import type { Question } from "@/lib/types";
import { QUESTION_TYPE_META } from "./questionTypes";

interface QuestionListProps {
  questions: Question[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onReorder: (orderedIds: string[]) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onAddClick: () => void;
}

export function QuestionList({
  questions,
  selectedId,
  onSelect,
  onReorder,
  onDelete,
  onDuplicate,
  onAddClick,
}: QuestionListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const ids = questions.map((q) => q.id);
    const oldIndex = ids.indexOf(String(active.id));
    const newIndex = ids.indexOf(String(over.id));
    const reordered = [...ids];
    reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, String(active.id));
    onReorder(reordered);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-paper-soft/60">
      <p className="px-4 pt-3 text-xs font-semibold uppercase tracking-wide text-ink-soft">Pages</p>
      <div className="flex-1 overflow-y-auto p-3">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={questions.map((q) => q.id)} strategy={verticalListSortingStrategy}>
            <div className="flex flex-col gap-1.5">
              {questions.map((question, index) => (
                <SortableQuestionItem
                  key={question.id}
                  question={question}
                  index={index}
                  selected={question.id === selectedId}
                  onSelect={() => onSelect(question.id)}
                  onDelete={() => onDelete(question.id)}
                  onDuplicate={() => onDuplicate(question.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
      <div className="border-t border-line p-3">
        <button
          onClick={onAddClick}
          className="w-full rounded-lg border border-dashed border-line py-2.5 text-sm font-semibold text-ink-soft hover:border-ink hover:text-ink"
        >
          + Add content
        </button>
      </div>
    </div>
  );
}

function SortableQuestionItem({
  question,
  index,
  selected,
  onSelect,
  onDelete,
  onDuplicate,
}: {
  question: Question;
  index: number;
  selected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: question.id });
  const meta = QUESTION_TYPE_META[question.type];
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`group relative flex items-center gap-2 rounded-xl px-2.5 py-2 text-sm transition-colors ${
        selected ? "bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05)] ring-1 ring-ink/5" : "hover:bg-white/50"
      } ${isDragging ? "z-10 opacity-70" : ""}`}
    >
      <button
        {...attributes}
        {...listeners}
        aria-label="Drag to reorder"
        className="cursor-grab touch-none px-0.5 text-ink-soft/50 active:cursor-grabbing"
      >
        ⠿
      </button>
      <button onClick={onSelect} className="flex flex-1 items-center gap-2 overflow-hidden text-left">
        <span className="w-4 shrink-0 text-center text-xs text-ink-soft">{index + 1}</span>
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-paper-soft text-[10px] font-bold text-ink-soft">
          {meta.icon}
        </span>
        <span className="truncate text-ink">{question.title || meta.defaultTitle}</span>
      </button>

      <button
        onClick={() => setMenuOpen((v) => !v)}
        aria-label="Question options"
        className="shrink-0 rounded px-1.5 py-1 text-ink-soft/50 opacity-0 hover:bg-paper-soft hover:text-ink group-hover:opacity-100"
      >
        ⋯
      </button>

      {menuOpen && (
        <div
          className="absolute right-2 top-9 z-10 w-36 rounded-lg border border-line bg-white py-1 text-sm shadow-lg"
          onMouseLeave={() => setMenuOpen(false)}
        >
          <button
            className="block w-full px-3 py-1.5 text-left hover:bg-paper-soft"
            onClick={() => {
              setMenuOpen(false);
              onDuplicate();
            }}
          >
            Duplicate
          </button>
          <button
            className="block w-full px-3 py-1.5 text-left text-danger hover:bg-paper-soft"
            onClick={() => {
              setMenuOpen(false);
              onDelete();
            }}
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
