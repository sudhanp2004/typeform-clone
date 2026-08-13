export type QuestionType =
  | "short_text"
  | "long_text"
  | "multiple_choice"
  | "dropdown"
  | "email"
  | "number"
  | "yes_no"
  | "rating";

export type FormStatus = "draft" | "published";

export interface QuestionOptions {
  choices?: string[];
  max_rating?: number;
}

export interface Question {
  id: string;
  type: QuestionType;
  title: string;
  description: string | null;
  required: boolean;
  order_index: number;
  options: QuestionOptions;
}

export interface FormListItem {
  id: string;
  title: string;
  status: FormStatus;
  created_at: string;
  updated_at: string;
  response_count: number;
}

export interface ScreenContent {
  title?: string;
  subtitle?: string;
}

export interface FormTheme {
  accent_color?: string;
  background?: string;
  font?: string;
}

export interface FormDetail {
  id: string;
  title: string;
  description: string | null;
  status: FormStatus;
  theme: FormTheme;
  welcome_screen: ScreenContent;
  thank_you_screen: ScreenContent;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  questions: Question[];
}

export interface PublicForm {
  id: string;
  title: string;
  description: string | null;
  theme: FormTheme;
  welcome_screen: ScreenContent;
  thank_you_screen: ScreenContent;
  questions: Question[];
}

export interface ResponseListItem {
  id: string;
  is_complete: boolean;
  started_at: string;
  submitted_at: string | null;
  answer_count: number;
}

export interface Answer {
  question_id: string;
  value: unknown;
}

export interface ResponseDetail {
  id: string;
  is_complete: boolean;
  started_at: string;
  submitted_at: string | null;
  answers: Answer[];
}

export interface QuestionSummary {
  question_id: string;
  title: string;
  type: QuestionType;
  total_answers: number;
  counts: Record<string, number> | null;
  average: number | null;
}

export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  short_text: "Short text",
  long_text: "Long text",
  multiple_choice: "Multiple choice",
  dropdown: "Dropdown",
  email: "Email",
  number: "Number",
  yes_no: "Yes / No",
  rating: "Rating",
};
