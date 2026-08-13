import type { Question } from "./types";

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export function validateAnswer(question: Question, value: unknown): string | null {
  const isEmpty = value === undefined || value === null || value === "" || (Array.isArray(value) && value.length === 0);

  if (question.required && isEmpty) {
    return "This question is required";
  }
  if (isEmpty) return null;

  switch (question.type) {
    case "email":
      if (!EMAIL_RE.test(String(value))) return "Enter a valid email address";
      break;
    case "number":
      if (Number.isNaN(Number(value))) return "Enter a number";
      break;
    case "rating": {
      const max = question.options.max_rating ?? 5;
      const n = Number(value);
      if (Number.isNaN(n) || n < 1 || n > max) return `Pick a rating between 1 and ${max}`;
      break;
    }
    default:
      break;
  }
  return null;
}
