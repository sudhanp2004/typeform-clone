import enum
import uuid
from datetime import datetime, timezone
from typing import Any

from sqlalchemy import JSON, Boolean, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


def _uuid() -> str:
    return uuid.uuid4().hex


def _now() -> datetime:
    return datetime.now(timezone.utc)


class QuestionType(str, enum.Enum):
    short_text = "short_text"
    long_text = "long_text"
    multiple_choice = "multiple_choice"
    dropdown = "dropdown"
    email = "email"
    number = "number"
    yes_no = "yes_no"
    rating = "rating"
    file_upload = "file_upload"


class FormStatus(str, enum.Enum):
    draft = "draft"
    published = "published"


class Creator(Base):
    __tablename__ = "creators"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    name: Mapped[str] = mapped_column(String, nullable=False)
    email: Mapped[str] = mapped_column(String, nullable=False, unique=True)

    forms: Mapped[list["Form"]] = relationship(back_populates="creator", cascade="all, delete-orphan")


class Form(Base):
    __tablename__ = "forms"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    creator_id: Mapped[str] = mapped_column(ForeignKey("creators.id"), nullable=False)
    title: Mapped[str] = mapped_column(String, nullable=False, default="Untitled form")
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String, nullable=False, default=FormStatus.draft.value)
    theme: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)
    welcome_screen: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)
    thank_you_screen: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now, onupdate=_now)
    published_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    creator: Mapped["Creator"] = relationship(back_populates="forms")
    questions: Mapped[list["Question"]] = relationship(
        back_populates="form", cascade="all, delete-orphan", order_by="Question.order_index"
    )
    responses: Mapped[list["Response"]] = relationship(back_populates="form", cascade="all, delete-orphan")


class Question(Base):
    __tablename__ = "questions"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    form_id: Mapped[str] = mapped_column(ForeignKey("forms.id"), nullable=False)
    type: Mapped[str] = mapped_column(String, nullable=False)
    title: Mapped[str] = mapped_column(String, nullable=False, default="")
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    required: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    order_index: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    # choice options for multiple_choice/dropdown, max value for rating, etc.
    options: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)
    # logic jumps: [{"value": <answer value that triggers this rule>, "target_question_id": <question id | "end">}, ...]
    # only meaningful for multiple_choice/dropdown/yes_no; evaluated in order, first match wins.
    # no match (or non-branchable type) falls through to the next question in order_index.
    branching_rules: Mapped[list[dict]] = mapped_column(JSON, nullable=False, default=list)

    form: Mapped["Form"] = relationship(back_populates="questions")
    answers: Mapped[list["Answer"]] = relationship(back_populates="question", cascade="all, delete-orphan")


class Response(Base):
    __tablename__ = "responses"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    form_id: Mapped[str] = mapped_column(ForeignKey("forms.id"), nullable=False)
    is_complete: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)
    submitted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    form: Mapped["Form"] = relationship(back_populates="responses")
    answers: Mapped[list["Answer"]] = relationship(
        back_populates="response", cascade="all, delete-orphan", order_by="Answer.created_at"
    )


class Answer(Base):
    __tablename__ = "answers"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    response_id: Mapped[str] = mapped_column(ForeignKey("responses.id"), nullable=False)
    question_id: Mapped[str] = mapped_column(ForeignKey("questions.id"), nullable=False)
    # raw answer value (string/number/bool/list depending on question type), stored as-is
    value: Mapped[Any] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)

    response: Mapped["Response"] = relationship(back_populates="answers")
    question: Mapped["Question"] = relationship(back_populates="answers")
