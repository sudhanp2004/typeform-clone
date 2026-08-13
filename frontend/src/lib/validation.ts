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
    case "short_text":
    case "long_text": {
      const text = String(value);
      const { max_length, answer_format } = question.options;
      if (max_length && text.length > max_length) return `Must be ${max_length} characters or fewer`;
      if (answer_format === "letters" && !/^[A-Za-z\s]*$/.test(text)) return "Letters only";
      if (answer_format === "numbers" && !/^[0-9\s]*$/.test(text)) return "Numbers only";
      if (answer_format === "alphanumeric" && !/^[A-Za-z0-9\s]*$/.test(text)) return "Letters and numbers only";
      break;
    }
    case "number": {
      const n = Number(value);
      if (Number.isNaN(n)) return "Enter a number";
      const { min_value, max_value } = question.options;
      if (min_value != null && n < min_value) return `Must be at least ${min_value}`;
      if (max_value != null && n > max_value) return `Must be at most ${max_value}`;
      break;
    }
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
