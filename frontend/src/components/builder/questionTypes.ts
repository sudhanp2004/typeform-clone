import type { Question, QuestionType } from "@/lib/types";

export const QUESTION_TYPE_META: Record<QuestionType, { label: string; icon: string; defaultTitle: string }> = {
  short_text: { label: "Short text", icon: "Aa", defaultTitle: "Untitled short answer question" },
  long_text: { label: "Long text", icon: "¶", defaultTitle: "Untitled long answer question" },
  multiple_choice: { label: "Multiple choice", icon: "☰", defaultTitle: "Untitled multiple choice question" },
  dropdown: { label: "Dropdown", icon: "▾", defaultTitle: "Untitled dropdown question" },
  email: { label: "Email", icon: "@", defaultTitle: "What's your email address?" },
  number: { label: "Number", icon: "#", defaultTitle: "Untitled number question" },
  yes_no: { label: "Yes / No", icon: "✓", defaultTitle: "Untitled yes/no question" },
  rating: { label: "Rating", icon: "★", defaultTitle: "How would you rate this?" },
  file_upload: { label: "File upload", icon: "⇧", defaultTitle: "Upload a file" },
};

export const QUESTION_TYPE_ORDER: QuestionType[] = [
  "short_text",
  "long_text",
  "multiple_choice",
  "dropdown",
  "yes_no",
  "rating",
  "email",
  "number",
  "file_upload",
];

export function defaultOptionsForType(type: QuestionType): Question["options"] {
  if (type === "multiple_choice" || type === "dropdown") {
    return { choices: ["Option 1", "Option 2"] };
  }
  if (type === "rating") {
    return { max_rating: 5 };
  }
  return {};
}
