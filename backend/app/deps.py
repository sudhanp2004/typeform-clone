from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session

from app import models
from app.database import get_db

DEFAULT_CREATOR_EMAIL = "creator@typeform-clone.dev"


def get_default_creator(db: Session = Depends(get_db)) -> models.Creator:
    """
    Auth is intentionally simplified per the assignment spec: the app always
    acts as a single default creator rather than implementing real login.
    """
    creator = db.query(models.Creator).filter_by(email=DEFAULT_CREATOR_EMAIL).first()
    if creator is None:
        creator = models.Creator(name="Default Creator", email=DEFAULT_CREATOR_EMAIL)
        db.add(creator)
        db.commit()
        db.refresh(creator)
    return creator


def get_owned_form(
    form_id: str,
    db: Session = Depends(get_db),
    creator: models.Creator = Depends(get_default_creator),
) -> models.Form:
    form = db.get(models.Form, form_id)
    if not form or form.creator_id != creator.id:
        raise HTTPException(status_code=404, detail="Form not found")
    return form


def get_published_form(form_id: str, db: Session) -> models.Form:
    """Resolves a public form-fill URL, which may carry either the form's raw id or a
    creator-chosen custom slug (Share tab's "Edit" URL) — both point at the same form."""
    form = db.get(models.Form, form_id) or db.query(models.Form).filter_by(slug=form_id).first()
    if not form or form.status != models.FormStatus.published.value:
        raise HTTPException(status_code=404, detail="Form not found")
    return form
