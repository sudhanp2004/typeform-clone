"use client";

import { useEffect, useState } from "react";
import {
  addQuestion,
  deleteQuestion,
  getForm,
  reorderQuestions,
  updateForm,
  updateQuestion,
  type QuestionInput,
} from "@/lib/api";
import type { FormDetail, FormTheme, Question, QuestionType, ScreenContent } from "@/lib/types";
import { useToast } from "@/components/ui/Toast";
import { RespondentFlow } from "@/components/respondent/RespondentFlow";
import { BuilderHeader, type BuilderTab } from "./BuilderHeader";
import { BuilderToolbar } from "./BuilderToolbar";
import { QuestionList } from "./QuestionList";
import { QuestionTypePicker } from "./QuestionTypePicker";
import { EditorCanvas } from "./EditorCanvas";
import { QuestionSettingsPanel } from "./QuestionSettingsPanel";
import { ComingSoonPanel } from "./ComingSoonPanel";
import { WorkflowPanel } from "./WorkflowPanel";
import { ScreenEditor } from "./ScreenEditor";
import { WelcomeScreenRow } from "./WelcomeScreenRow";
import { EndingsSection } from "./EndingsSection";
import { DesignPanel } from "./DesignPanel";
import { defaultOptionsForType } from "./questionTypes";

type Selection = { kind: "question"; id: string } | { kind: "welcome" } | { kind: "ending" };

export function FormBuilder({ formId }: { formId: string }) {
  const [form, setForm] = useState<FormDetail | null>(null);
  const [selection, setSelection] = useState<Selection | null>(null);
  const [activeTab, setActiveTab] = useState<BuilderTab>("content");
  const [addPickerOpen, setAddPickerOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [designOpen, setDesignOpen] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    getForm(formId)
      .then((data) => {
        setForm(data);
        setSelection(data.questions[0] ? { kind: "question", id: data.questions[0].id } : null);
      })
      .catch(() => showToast("Couldn't load this form", "error"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formId]);

  if (!form) {
    return <div className="flex flex-1 items-center justify-center text-ink-soft">Loading…</div>;
  }

  const selectedQuestion =
    selection?.kind === "question" ? form.questions.find((q) => q.id === selection.id) ?? null : null;
  const accentColor = form.theme.accent_color || "#262626";

  const handleRename = async (title: string) => {
    setForm((f) => (f ? { ...f, title } : f));
    try {
      await updateForm(formId, { title });
    } catch {
      showToast("Couldn't save the new title", "error");
    }
  };

  const handleTogglePublish = async () => {
    const nextStatus = form.status === "published" ? "draft" : "published";
    if (nextStatus === "published" && form.questions.length === 0) {
      showToast("Add at least one question before publishing", "error");
      return;
    }
    try {
      const updated = await updateForm(formId, { status: nextStatus });
      setForm(updated);
      showToast(nextStatus === "published" ? "Form published" : "Form unpublished", "success");
    } catch {
      showToast("Couldn't update the form's status", "error");
    }
  };

  const handleAddQuestion = async (type: QuestionType) => {
    setAddPickerOpen(false);
    try {
      const question = await addQuestion(formId, {
        type,
        title: "",
        required: false,
        options: defaultOptionsForType(type),
      });
      setForm((f) => (f ? { ...f, questions: [...f.questions, question] } : f));
      setSelection({ kind: "question", id: question.id });
    } catch {
      showToast("Couldn't add the question", "error");
    }
  };

  const handleUpdateQuestion = async (questionId: string, patch: Partial<QuestionInput>) => {
    setForm((f) =>
      f
        ? {
            ...f,
            questions: f.questions.map((q) => (q.id === questionId ? { ...q, ...patch } as Question : q)),
          }
        : f
    );
    try {
      await updateQuestion(formId, questionId, patch);
    } catch {
      showToast("Couldn't save your change", "error");
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    const remaining = form.questions.filter((q) => q.id !== questionId);
    setForm((f) => (f ? { ...f, questions: remaining } : f));
    if (selection?.kind === "question" && selection.id === questionId) {
      setSelection(remaining[0] ? { kind: "question", id: remaining[0].id } : null);
    }
    try {
      await deleteQuestion(formId, questionId);
    } catch {
      showToast("Couldn't delete the question", "error");
    }
  };

  const handleDuplicateQuestion = async (questionId: string) => {
    const original = form.questions.find((q) => q.id === questionId);
    if (!original) return;
    try {
      const copy = await addQuestion(formId, {
        type: original.type,
        title: original.title,
        description: original.description,
        required: original.required,
        options: original.options,
        branching_rules: original.branching_rules,
      });
      const baseIds = form.questions.map((q) => q.id);
      const insertAt = baseIds.indexOf(questionId) + 1;
      const orderedIds = [...baseIds.slice(0, insertAt), copy.id, ...baseIds.slice(insertAt)];

      const byId = new Map([...form.questions, copy].map((q) => [q.id, q]));
      const reordered = orderedIds.map((id, i) => ({ ...byId.get(id)!, order_index: i }));
      setForm((f) => (f ? { ...f, questions: reordered } : f));
      setSelection({ kind: "question", id: copy.id });

      await reorderQuestions(formId, orderedIds);
    } catch {
      showToast("Couldn't duplicate the question", "error");
    }
  };

  const handleReorder = async (orderedIds: string[]) => {
    const byId = new Map(form.questions.map((q) => [q.id, q]));
    const reordered = orderedIds.map((id, i) => ({ ...byId.get(id)!, order_index: i }));
    setForm((f) => (f ? { ...f, questions: reordered } : f));
    try {
      await reorderQuestions(formId, orderedIds);
    } catch {
      showToast("Couldn't save the new order", "error");
    }
  };

  const handleUpdateWelcome = async (patch: ScreenContent) => {
    setForm((f) => (f ? { ...f, welcome_screen: patch } : f));
    try {
      await updateForm(formId, { welcome_screen: patch });
    } catch {
      showToast("Couldn't save the welcome screen", "error");
    }
  };

  const handleUpdateThankYou = async (patch: ScreenContent) => {
    setForm((f) => (f ? { ...f, thank_you_screen: patch } : f));
    try {
      await updateForm(formId, { thank_you_screen: patch });
    } catch {
      showToast("Couldn't save the thank you screen", "error");
    }
  };

  const handleUpdateTheme = async (patch: Partial<FormTheme>) => {
    const nextTheme = { ...form.theme, ...patch };
    setForm((f) => (f ? { ...f, theme: nextTheme } : f));
    try {
      await updateForm(formId, { theme: nextTheme });
    } catch {
      showToast("Couldn't save the theme", "error");
    }
  };

  return (
    <div className="flex h-screen flex-col">
      <BuilderHeader
        formId={formId}
        slug={form.slug}
        title={form.title}
        status={form.status}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onRename={handleRename}
        onTogglePublish={handleTogglePublish}
        onPreview={() => setPreviewOpen(true)}
      />

      {activeTab === "content" && (
        <div className="flex flex-1 flex-col overflow-hidden">
          <BuilderToolbar
            onAddClick={() => setAddPickerOpen(true)}
            onPreviewClick={() => setPreviewOpen(true)}
            onDesignClick={() => setDesignOpen(true)}
          />

          <div className="flex flex-1 overflow-hidden">
            <div className="flex w-72 shrink-0 flex-col border-r border-line">
              <QuestionList
                questions={form.questions}
                selectedId={selection?.kind === "question" ? selection.id : null}
                onSelect={(id) => setSelection({ kind: "question", id })}
                onReorder={handleReorder}
                onDelete={handleDeleteQuestion}
                onDuplicate={handleDuplicateQuestion}
                onAddClick={() => setAddPickerOpen(true)}
              />
              <WelcomeScreenRow
                screen={form.welcome_screen}
                selected={selection?.kind === "welcome"}
                onSelect={() => setSelection({ kind: "welcome" })}
              />
              <EndingsSection
                screen={form.thank_you_screen}
                selected={selection?.kind === "ending"}
                onSelect={() => setSelection({ kind: "ending" })}
              />
            </div>

            <div className="flex flex-1 flex-col overflow-y-auto bg-white">
              {selection?.kind === "welcome" && (
                <ScreenEditor key="welcome" kind="welcome" screen={form.welcome_screen} onUpdate={handleUpdateWelcome} />
              )}
              {selection?.kind === "ending" && (
                <ScreenEditor key="ending" kind="ending" screen={form.thank_you_screen} onUpdate={handleUpdateThankYou} />
              )}
              {selection?.kind === "question" && selectedQuestion && (
                <EditorCanvas
                  key={selectedQuestion.id}
                  question={selectedQuestion}
                  accentColor={accentColor}
                  background={form.theme.background}
                  font={form.theme.font}
                  onUpdate={(patch) => handleUpdateQuestion(selectedQuestion.id, patch)}
                />
              )}
              {!selection && (
                <div className="flex h-full flex-col items-center justify-center gap-3 text-ink-soft">
                  <p>This form doesn&apos;t have any questions yet.</p>
                  <button
                    onClick={() => setAddPickerOpen(true)}
                    className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white"
                  >
                    + Add your first question
                  </button>
                </div>
              )}
            </div>

            {selection?.kind === "question" && selectedQuestion && (
              <div className="w-72 shrink-0">
                <QuestionSettingsPanel
                  question={selectedQuestion}
                  allQuestions={form.questions}
                  onChangeType={(type) =>
                    handleUpdateQuestion(selectedQuestion.id, { type, options: defaultOptionsForType(type) })
                  }
                  onToggleRequired={() =>
                    handleUpdateQuestion(selectedQuestion.id, { required: !selectedQuestion.required })
                  }
                  onChangeOptions={(patch) =>
                    handleUpdateQuestion(selectedQuestion.id, { options: { ...selectedQuestion.options, ...patch } })
                  }
                  onChangeBranching={(branchingRules) =>
                    handleUpdateQuestion(selectedQuestion.id, { branching_rules: branchingRules })
                  }
                />
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "workflow" && (
        <WorkflowPanel questions={form.questions} onPreviewClick={() => setPreviewOpen(true)} />
      )}

      {activeTab === "connect" && (
        <ComingSoonPanel
          icon="🔌"
          title="Connect"
          description="Integrations and webhooks — send responses straight to Google Sheets, Slack, Zapier, and 80+ other apps as they come in."
        />
      )}

      <QuestionTypePicker open={addPickerOpen} onClose={() => setAddPickerOpen(false)} onPick={handleAddQuestion} />

      <DesignPanel
        open={designOpen}
        onClose={() => setDesignOpen(false)}
        theme={form.theme}
        onUpdate={handleUpdateTheme}
      />

      {previewOpen && (
        <div className="fixed inset-0 z-50 bg-paper">
          <button
            onClick={() => setPreviewOpen(false)}
            className="fixed right-6 top-6 z-50 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white shadow-lg"
          >
            ✕ Close preview
          </button>
          <RespondentFlow
            form={{
              id: form.id,
              title: form.title,
              description: form.description,
              theme: form.theme,
              welcome_screen: form.welcome_screen,
              thank_you_screen: form.thank_you_screen,
              questions: form.questions,
            }}
            previewMode
          />
        </div>
      )}
    </div>
  );
}
