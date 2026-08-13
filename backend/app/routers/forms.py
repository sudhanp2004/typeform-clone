from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import case, func
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import get_db
from app.deps import get_default_creator, get_owned_form

router = APIRouter(prefix="/api/forms", tags=["forms"])


@router.get("", response_model=list[schemas.FormListItem])
def list_forms(db: Session = Depends(get_db), creator=Depends(get_default_creator)):
    # response_count only counts completed submissions — a visitor who opened
    # the link but never finished shouldn't inflate the number a creator sees.
    # total_response_count counts every started response (complete or not),
    # so the dashboard can show a real completion rate per form.
    rows = (
        db.query(
            models.Form,
            func.sum(case((models.Response.is_complete.is_(True), 1), else_=0)).label("response_count"),
            func.count(models.Response.id).label("total_response_count"),
        )
        .outerjoin(models.Response, models.Response.form_id == models.Form.id)
        .filter(models.Form.creator_id == creator.id)
        .group_by(models.Form.id)
        .order_by(models.Form.updated_at.desc())
        .all()
    )
    out = []
    for form, response_count, total_response_count in rows:
        item = schemas.FormListItem.model_validate(form)
        item.response_count = response_count or 0
        item.total_response_count = total_response_count or 0
        out.append(item)
    return out


@router.post("", response_model=schemas.FormDetail, status_code=201)
def create_form(payload: schemas.FormCreate, db: Session = Depends(get_db), creator=Depends(get_default_creator)):
    form = models.Form(creator_id=creator.id, title=payload.title)
    db.add(form)
    db.commit()
    db.refresh(form)
    return form


@router.get("/{form_id}", response_model=schemas.FormDetail)
def get_form(form: models.Form = Depends(get_owned_form)):
    return form


@router.patch("/{form_id}", response_model=schemas.FormDetail)
def update_form(
    payload: schemas.FormUpdate, db: Session = Depends(get_db), form: models.Form = Depends(get_owned_form)
):
    data = payload.model_dump(exclude_unset=True)

    if "status" in data:
        if data["status"] == "published" and form.status != "published":
            form.published_at = datetime.now(timezone.utc)
        if data["status"] == "draft":
            form.published_at = None

    for field, value in data.items():
        setattr(form, field, value)

    db.commit()
    db.refresh(form)
    return form


@router.post("/{form_id}/duplicate", response_model=schemas.FormDetail, status_code=201)
def duplicate_form(
    db: Session = Depends(get_db),
    creator=Depends(get_default_creator),
    form: models.Form = Depends(get_owned_form),
):
    copy = models.Form(
        creator_id=creator.id,
        title=f"{form.title} (copy)",
        description=form.description,
        status=models.FormStatus.draft.value,
        theme=dict(form.theme),
        welcome_screen=dict(form.welcome_screen),
        thank_you_screen=dict(form.thank_you_screen),
    )
    db.add(copy)
    db.flush()

    for q in form.questions:
        db.add(
            models.Question(
                form_id=copy.id,
                type=q.type,
                title=q.title,
                description=q.description,
                required=q.required,
                order_index=q.order_index,
                options=dict(q.options),
            )
        )

    db.commit()
    db.refresh(copy)
    return copy


@router.delete("/{form_id}", status_code=204)
def delete_form(db: Session = Depends(get_db), form: models.Form = Depends(get_owned_form)):
    db.delete(form)
    db.commit()
