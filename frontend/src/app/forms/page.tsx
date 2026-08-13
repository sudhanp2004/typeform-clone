"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createForm, deleteForm, duplicateForm, listForms } from "@/lib/api";
import type { FormListItem } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { FormCard } from "@/components/dashboard/FormCard";
import { FormsTable } from "@/components/dashboard/FormsTable";
import { WorkspaceHeader } from "@/components/dashboard/WorkspaceHeader";
import { SortMenu, type SortOption } from "@/components/dashboard/SortMenu";
import { ViewToggle, type ViewMode } from "@/components/dashboard/ViewToggle";

function sortForms(forms: FormListItem[], sort: SortOption): FormListItem[] {
  const sorted = [...forms];
  if (sort === "created") sorted.sort((a, b) => b.created_at.localeCompare(a.created_at));
  else if (sort === "name") sorted.sort((a, b) => a.title.localeCompare(b.title));
  else sorted.sort((a, b) => b.updated_at.localeCompare(a.updated_at));
  return sorted;
}

export default function FormsDashboard() {
  const [forms, setForms] = useState<FormListItem[] | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [creating, setCreating] = useState(false);
  const [sort, setSort] = useState<SortOption>("updated");
  const [view, setView] = useState<ViewMode>("list");
  const router = useRouter();
  const { showToast } = useToast();

  const sortedForms = useMemo(() => (forms ? sortForms(forms, sort) : null), [forms, sort]);

  const refresh = async () => {
    const data = await listForms();
    setForms(data);
  };

  useEffect(() => {
    let cancelled = false;
    listForms()
      .then((data) => {
        if (!cancelled) setForms(data);
      })
      .catch(() => {
        if (!cancelled) showToast("Couldn't load your forms", "error");
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreate = async () => {
    setCreating(true);
    try {
      const form = await createForm(newTitle.trim() || "Untitled form");
      showToast("Form created", "success");
      router.push(`/forms/${form.id}/edit`);
    } catch {
      showToast("Couldn't create the form", "error");
    } finally {
      setCreating(false);
      setCreateOpen(false);
      setNewTitle("");
    }
  };

  const handleDuplicate = async (formId: string) => {
    try {
      await duplicateForm(formId);
      showToast("Form duplicated", "success");
      refresh();
    } catch {
      showToast("Couldn't duplicate the form", "error");
    }
  };

  const handleDelete = async (formId: string) => {
    if (!confirm("Delete this form and all of its responses? This can't be undone.")) return;
    try {
      await deleteForm(formId);
      showToast("Form deleted", "success");
      refresh();
    } catch {
      showToast("Couldn't delete the form", "error");
    }
  };

  return (
    <div className="flex-1">
      <WorkspaceHeader />

      <div className="mx-auto w-full max-w-5xl px-6 py-10">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-ink">Your forms</h1>
            <p className="mt-1 text-sm text-ink-soft">Create, edit, and publish conversational forms.</p>
          </div>
          <Button onClick={() => setCreateOpen(true)}>+ Create form</Button>
        </div>

        {forms === null && <p className="text-sm text-ink-soft">Loading…</p>}

        {forms?.length === 0 && (
          <div className="rounded-2xl border border-dashed border-line py-24 text-center">
            <p className="text-ink-soft">You don&apos;t have any forms yet.</p>
            <Button className="mt-4" onClick={() => setCreateOpen(true)}>
              + Create your first form
            </Button>
          </div>
        )}

        {sortedForms && sortedForms.length > 0 && (
          <>
            <div className="mb-4 flex items-center justify-between">
              <SortMenu value={sort} onChange={setSort} />
              <ViewToggle value={view} onChange={setView} />
            </div>

            {view === "list" ? (
              <FormsTable forms={sortedForms} onDuplicate={handleDuplicate} onDelete={handleDelete} />
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {sortedForms.map((form) => (
                  <FormCard
                    key={form.id}
                    form={form}
                    onDuplicate={() => handleDuplicate(form.id)}
                    onDelete={() => handleDelete(form.id)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Name your form">
        <Input
          autoFocus
          placeholder="e.g. Customer feedback survey"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCreate()}
        />
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setCreateOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={creating}>
            {creating ? "Creating…" : "Create form"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
