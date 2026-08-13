import type {
  FormDetail,
  FormListItem,
  PublicForm,
  Question,
  QuestionSummary,
  QuestionType,
  ResponseDetail,
  ResponseListItem,
} from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: res.statusText }));
    throw new ApiError(body.detail ?? "Request failed", res.status);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// ---------- Creator: forms ----------

export const listForms = () => request<FormListItem[]>("/api/forms");

export const createForm = (title: string) =>
  request<FormDetail>("/api/forms", { method: "POST", body: JSON.stringify({ title }) });

export const getForm = (formId: string) => request<FormDetail>(`/api/forms/${formId}`);

export const updateForm = (formId: string, payload: Partial<Pick<FormDetail, "title" | "description" | "status" | "theme" | "welcome_screen" | "thank_you_screen">>) =>
  request<FormDetail>(`/api/forms/${formId}`, { method: "PATCH", body: JSON.stringify(payload) });

export const duplicateForm = (formId: string) =>
  request<FormDetail>(`/api/forms/${formId}/duplicate`, { method: "POST" });

export const deleteForm = (formId: string) => request<void>(`/api/forms/${formId}`, { method: "DELETE" });

// ---------- Creator: questions ----------

export interface QuestionInput {
  type: QuestionType;
  title: string;
  description?: string | null;
  required?: boolean;
  options?: Question["options"];
}

export const addQuestion = (formId: string, payload: QuestionInput) =>
  request<Question>(`/api/forms/${formId}/questions`, { method: "POST", body: JSON.stringify(payload) });

export const updateQuestion = (formId: string, questionId: string, payload: Partial<QuestionInput>) =>
  request<Question>(`/api/forms/${formId}/questions/${questionId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

export const deleteQuestion = (formId: string, questionId: string) =>
  request<void>(`/api/forms/${formId}/questions/${questionId}`, { method: "DELETE" });

export const reorderQuestions = (formId: string, questionIds: string[]) =>
  request<Question[]>(`/api/forms/${formId}/questions/reorder`, {
    method: "PATCH",
    body: JSON.stringify({ question_ids: questionIds }),
  });

// ---------- Creator: responses / results ----------

export const listResponses = (formId: string) => request<ResponseListItem[]>(`/api/forms/${formId}/responses`);

export const getResponse = (formId: string, responseId: string) =>
  request<ResponseDetail>(`/api/forms/${formId}/responses/${responseId}`);

export const getResponseSummary = (formId: string) =>
  request<QuestionSummary[]>(`/api/forms/${formId}/responses/summary`);

export const exportResponsesUrl = (formId: string) => `${API_URL}/api/forms/${formId}/responses/export`;

// ---------- Public respondent ----------

export const getPublicForm = (formId: string) => request<PublicForm>(`/api/public/forms/${formId}`);

export const startPublicResponse = (formId: string) =>
  request<{ response_id: string }>(`/api/public/forms/${formId}/responses`, { method: "POST" });

export const submitPublicResponse = (
  formId: string,
  responseId: string,
  answers: { question_id: string; value: unknown }[],
  isComplete: boolean
) =>
  request<ResponseDetail>(`/api/public/forms/${formId}/responses/${responseId}`, {
    method: "PATCH",
    body: JSON.stringify({ answers, is_complete: isComplete }),
  });
