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

    submitted_ids = {a.question_id for a in payload.answers}
    if payload.is_complete:
        for question in form.questions:
            if question.required and question.id not in submitted_ids:
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
