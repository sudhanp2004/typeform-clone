from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import get_db
from app.deps import get_owned_form

router = APIRouter(prefix="/api/forms/{form_id}/questions", tags=["questions"])


def _get_owned_question(form: models.Form, question_id: str, db: Session) -> models.Question:
    question = db.get(models.Question, question_id)
    if not question or question.form_id != form.id:
        raise HTTPException(status_code=404, detail="Question not found")
    return question


@router.post("", response_model=schemas.QuestionOut, status_code=201)
def add_question(
    payload: schemas.QuestionCreate,
    db: Session = Depends(get_db),
    form: models.Form = Depends(get_owned_form),
):
    next_index = len(form.questions)
    question = models.Question(
        form_id=form.id,
        type=payload.type,
        title=payload.title,
        description=payload.description,
        required=payload.required,
        options=payload.options,
        order_index=next_index,
    )
    db.add(question)
    db.commit()
    db.refresh(question)
    return question


@router.patch("/reorder", response_model=list[schemas.QuestionOut])
def reorder_questions(
    payload: schemas.QuestionReorder,
    db: Session = Depends(get_db),
    form: models.Form = Depends(get_owned_form),
):
    # Registered before /{question_id} so "reorder" is never swallowed as a question id.
    existing_ids = {q.id for q in form.questions}
    if set(payload.question_ids) != existing_ids:
        raise HTTPException(status_code=400, detail="question_ids must match the form's existing questions")

    by_id = {q.id: q for q in form.questions}
    for index, qid in enumerate(payload.question_ids):
        by_id[qid].order_index = index

    db.commit()
    return sorted(form.questions, key=lambda q: q.order_index)


@router.patch("/{question_id}", response_model=schemas.QuestionOut)
def update_question(
    question_id: str,
    payload: schemas.QuestionUpdate,
    db: Session = Depends(get_db),
    form: models.Form = Depends(get_owned_form),
):
    question = _get_owned_question(form, question_id, db)

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(question, field, value)

    db.commit()
    db.refresh(question)
    return question


@router.delete("/{question_id}", status_code=204)
def delete_question(
    question_id: str,
    db: Session = Depends(get_db),
    form: models.Form = Depends(get_owned_form),
):
    question = _get_owned_question(form, question_id, db)
    db.delete(question)
    db.flush()

    for index, q in enumerate(sorted(form.questions, key=lambda q: q.order_index)):
        q.order_index = index

    db.commit()
