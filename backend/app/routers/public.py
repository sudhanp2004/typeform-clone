import re
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import get_db

router = APIRouter(prefix="/api/public/forms", tags=["public"])

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def _get_published_form(form_id: str, db: Session) -> models.Form:
    form = db.get(models.Form, form_id)
    if not form or form.status != models.FormStatus.published.value:
        raise HTTPException(status_code=404, detail="Form not found")
    return form


def _validate_answer(question: models.Question, value) -> None:
    is_empty = value is None or value == "" or value == []

    if question.required and is_empty:
        raise HTTPException(status_code=422, detail=f"'{question.title}' is required")

    if is_empty:
        return

    if question.type == "email" and not EMAIL_RE.match(str(value)):
        raise HTTPException(status_code=422, detail=f"'{question.title}' must be a valid email address")

    if question.type == "number":
        try:
            float(value)
        except (TypeError, ValueError):
            raise HTTPException(status_code=422, detail=f"'{question.title}' must be a number")

    if question.type in ("multiple_choice", "dropdown"):
        choices = question.options.get("choices", [])
        if choices and str(value) not in choices:
            raise HTTPException(status_code=422, detail=f"'{question.title}' has an invalid choice")

    if question.type == "yes_no" and str(value).lower() not in ("true", "false", "yes", "no"):
        raise HTTPException(status_code=422, detail=f"'{question.title}' must be yes or no")

    if question.type == "rating":
        max_rating = question.options.get("max_rating", 5)
        try:
            rating = float(value)
        except (TypeError, ValueError):
            raise HTTPException(status_code=422, detail=f"'{question.title}' must be a number")
        if not (0 < rating <= max_rating):
            raise HTTPException(status_code=422, detail=f"'{question.title}' must be between 1 and {max_rating}")


def _resolve_next_question(
    current: models.Question, answer: object, ordered_questions: list[models.Question]
) -> models.Question | None:
    """Mirrors the frontend's resolveNextQuestion (lib/branching.ts) so the server can
    independently verify which questions a respondent actually would have been shown,
    rather than trusting the client's notion of "which page it was on"."""
    for rule in current.branching_rules or []:
        if str(answer) == str(rule.get("value")):
            target_id = rule.get("target_question_id")
            if target_id == "end":
                return None
            target = next((q for q in ordered_questions if q.id == target_id), None)
            if target:
                return target
            break  # matched rule but its target question no longer exists; fall through to default

    index = ordered_questions.index(current)
    return ordered_questions[index + 1] if index + 1 < len(ordered_questions) else None


def _resolve_reachable_questions(
    ordered_questions: list[models.Question], answers: dict[str, object]
) -> list[models.Question]:
    if not ordered_questions:
        return []
    reachable: list[models.Question] = []
    visited: set[str] = set()
    current: models.Question | None = ordered_questions[0]
    while current is not None and current.id not in visited:
        visited.add(current.id)
        reachable.append(current)
        current = _resolve_next_question(current, answers.get(current.id), ordered_questions)
    return reachable


@router.get("/{form_id}", response_model=schemas.PublicForm)
def get_public_form(form_id: str, db: Session = Depends(get_db)):
    form = _get_published_form(form_id, db)
    return form


@router.post("/{form_id}/responses", status_code=201)
def start_response(form_id: str, db: Session = Depends(get_db)):
    form = _get_published_form(form_id, db)
    response = models.Response(form_id=form.id, is_complete=False)
    db.add(response)
    db.commit()
    db.refresh(response)
    return {"response_id": response.id}


@router.patch("/{form_id}/responses/{response_id}", response_model=schemas.ResponseDetail)
def submit_response(
    form_id: str,
    response_id: str,
    payload: schemas.ResponseSubmit,
    db: Session = Depends(get_db),
):
    form = _get_published_form(form_id, db)
    response = db.get(models.Response, response_id)
    if not response or response.form_id != form.id:
        raise HTTPException(status_code=404, detail="Response not found")

    questions_by_id = {q.id: q for q in form.questions}
    answers_by_question = {a.question_id: a for a in response.answers}

    if payload.is_complete:
        # Merge already-saved answers (from earlier partial PATCH calls) with this
        # payload so branching is resolved against the respondent's full answer set,
        # then only require fields on the path that answer set actually reaches —
        # a required question skipped via branching must not block submission.
        combined_values = {qid: a.value for qid, a in answers_by_question.items()}
        combined_values.update({a.question_id: a.value for a in payload.answers})
        ordered_questions = sorted(form.questions, key=lambda q: q.order_index)
        reachable = _resolve_reachable_questions(ordered_questions, combined_values)
        for question in reachable:
            if question.required and question.id not in combined_values:
                raise HTTPException(status_code=422, detail=f"'{question.title}' is required")

    for answer_in in payload.answers:
        question = questions_by_id.get(answer_in.question_id)
        if question is None:
            raise HTTPException(status_code=400, detail="Unknown question_id")

        _validate_answer(question, answer_in.value)

        existing = answers_by_question.get(question.id)
        if existing:
            existing.value = answer_in.value
        else:
            db.add(models.Answer(response_id=response.id, question_id=question.id, value=answer_in.value))

    response.is_complete = payload.is_complete
    if payload.is_complete:
        response.submitted_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(response)
    return response
