import csv
import io
import re
from collections import Counter

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import get_db
from app.deps import get_owned_form

router = APIRouter(prefix="/api/forms/{form_id}/responses", tags=["responses"])


@router.get("", response_model=list[schemas.ResponseListItem])
def list_responses(db: Session = Depends(get_db), form: models.Form = Depends(get_owned_form)):
    out = []
    for response in sorted(form.responses, key=lambda r: r.started_at, reverse=True):
        item = schemas.ResponseListItem.model_validate(response)
        item.answer_count = len(response.answers)
        out.append(item)
    return out


@router.get("/summary", response_model=list[schemas.QuestionSummary])
def response_summary(db: Session = Depends(get_db), form: models.Form = Depends(get_owned_form)):
    # Registered before /{response_id} so "summary" is never swallowed as a response id.
    summaries: list[schemas.QuestionSummary] = []

    for question in form.questions:
        answers = [a for r in form.responses for a in r.answers if a.question_id == question.id]
        values = [a.value for a in answers if a.value is not None and a.value != ""]

        summary = schemas.QuestionSummary(
            question_id=question.id,
            title=question.title,
            type=question.type,
            total_answers=len(values),
        )

        if question.type in ("multiple_choice", "dropdown", "yes_no"):
            summary.counts = dict(Counter(str(v) for v in values))
        elif question.type in ("rating", "number"):
            numeric = [float(v) for v in values if _is_number(v)]
            if numeric:
                summary.average = round(sum(numeric) / len(numeric), 2)

        summaries.append(summary)

    return summaries


def _is_number(value) -> bool:
    try:
        float(value)
        return True
    except (TypeError, ValueError):
        return False


def _safe_filename(title: str) -> str:
    # Content-Disposition filenames must be latin-1 encodable — an em dash or any other
    # non-ASCII character in a form title (e.g. "Frontend Engineer — Application") would
    # otherwise crash the response entirely, not just render oddly.
    ascii_title = title.encode("ascii", "ignore").decode("ascii")
    slug = re.sub(r"[^A-Za-z0-9]+", "-", ascii_title).strip("-")
    return slug or "form"


def _csv_cell(value, question_type: str, base_url: str) -> str:
    if value is None or value == "":
        return ""
    if question_type == "file_upload" and isinstance(value, dict):
        url = value.get("url", "")
        absolute_url = f"{base_url.rstrip('/')}{url}" if url.startswith("/") else url
        return f"{value.get('file_name', 'file')} ({absolute_url})"
    return str(value)


@router.get("/export")
def export_responses_csv(request: Request, db: Session = Depends(get_db), form: models.Form = Depends(get_owned_form)):
    # Registered before /{response_id} so "export" is never swallowed as a response id.
    buffer = io.StringIO()
    writer = csv.writer(buffer)

    questions = form.questions
    base_url = str(request.base_url)
    writer.writerow(["response_id", "submitted_at", "is_complete"] + [q.title or q.id for q in questions])

    for response in sorted(form.responses, key=lambda r: r.started_at):
        answers_by_question = {a.question_id: a.value for a in response.answers}
        row = [response.id, response.submitted_at or "", response.is_complete]
        for q in questions:
            value = answers_by_question.get(q.id)
            row.append(_csv_cell(value, q.type, base_url))
        writer.writerow(row)

    buffer.seek(0)
    filename = f"{_safe_filename(form.title or '')}-responses.csv"
    return StreamingResponse(
        iter([buffer.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("/{response_id}", response_model=schemas.ResponseDetail)
def get_response(
    response_id: str, db: Session = Depends(get_db), form: models.Form = Depends(get_owned_form)
):
    response = db.get(models.Response, response_id)
    if not response or response.form_id != form.id:
        raise HTTPException(status_code=404, detail="Response not found")
    return response
