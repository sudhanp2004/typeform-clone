import type { QuestionType } from "./types";
import { isFileAnswer } from "./types";

export function formatAnswerValue(value: unknown, type?: QuestionType): string {
  if (value === null || value === undefined || value === "") return "";
  if (type === "yes_no") return String(value) === "true" ? "Yes" : "No";
  if (type === "file_upload" && isFileAnswer(value)) return value.file_name;
  return String(value);
}
