import type { QuestionType } from "./types";

export function formatAnswerValue(value: unknown, type?: QuestionType): string {
  if (value === null || value === undefined || value === "") return "";
  if (type === "yes_no") return String(value) === "true" ? "Yes" : "No";
  return String(value);
}
