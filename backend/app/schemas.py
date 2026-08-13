from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field

QuestionTypeLiteral = Literal[
    "short_text",
    "long_text",
    "multiple_choice",
    "dropdown",
    "email",
    "number",
    "yes_no",
    "rating",
    "file_upload",
]

FormStatusLiteral = Literal["draft", "published"]


# ---------- Question ----------

class QuestionOptions(BaseModel):
    choices: list[str] | None = None
    max_rating: int | None = None


class BranchingRule(BaseModel):
    # value that triggers this jump (compared against the respondent's answer as a string)
    value: str
    # id of the question to jump to, or the literal "end" to skip straight to submission
    target_question_id: str


class QuestionCreate(BaseModel):
    type: QuestionTypeLiteral
    title: str = ""
    description: str | None = None
    required: bool = False
    options: dict[str, Any] = Field(default_factory=dict)
    branching_rules: list[BranchingRule] = Field(default_factory=list)


class QuestionUpdate(BaseModel):
    type: QuestionTypeLiteral | None = None
    title: str | None = None
    description: str | None = None
    required: bool | None = None
    options: dict[str, Any] | None = None
    branching_rules: list[BranchingRule] | None = None


class QuestionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    type: str
    title: str
    description: str | None
    required: bool
    order_index: int
    options: dict[str, Any]
    branching_rules: list[BranchingRule]


class QuestionReorder(BaseModel):
    question_ids: list[str]


# ---------- Form ----------

class FormCreate(BaseModel):
    title: str = "Untitled form"


class FormUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    status: FormStatusLiteral | None = None
    theme: dict[str, Any] | None = None
    welcome_screen: dict[str, Any] | None = None
    thank_you_screen: dict[str, Any] | None = None


class FormListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    title: str
    status: str
    created_at: datetime
    updated_at: datetime
    response_count: int = 0


class FormDetail(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    title: str
    description: str | None
    status: str
    theme: dict[str, Any]
    welcome_screen: dict[str, Any]
    thank_you_screen: dict[str, Any]
    created_at: datetime
    updated_at: datetime
    published_at: datetime | None
    questions: list[QuestionOut] = []


# ---------- Public respondent ----------

class PublicQuestion(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    type: str
    title: str
    description: str | None
    required: bool
    order_index: int
    options: dict[str, Any]
    branching_rules: list[BranchingRule]


class PublicForm(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    title: str
    description: str | None
    theme: dict[str, Any]
    welcome_screen: dict[str, Any]
    thank_you_screen: dict[str, Any]
    questions: list[PublicQuestion]


class AnswerIn(BaseModel):
    question_id: str
    value: Any


class ResponseSubmit(BaseModel):
    answers: list[AnswerIn]
    is_complete: bool = True


# ---------- Responses / results ----------

class AnswerOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    question_id: str
    value: Any


class ResponseListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    is_complete: bool
    started_at: datetime
    submitted_at: datetime | None
    answer_count: int = 0


class ResponseDetail(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    is_complete: bool
    started_at: datetime
    submitted_at: datetime | None
    answers: list[AnswerOut]


class QuestionSummary(BaseModel):
    question_id: str
    title: str
    type: str
    total_answers: int
    # for choice/yes_no/rating: value -> count
    counts: dict[str, int] | None = None
    # for rating/number: simple average
    average: float | None = None
