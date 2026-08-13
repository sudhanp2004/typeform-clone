import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app import models
from app.database import get_db
from app.storage import UPLOAD_DIR

router = APIRouter(prefix="/api/public/forms/{form_id}/uploads", tags=["uploads"])

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB
ALLOWED_EXTENSIONS = {".pdf", ".png", ".jpg", ".jpeg", ".gif", ".webp", ".doc", ".docx", ".txt", ".csv", ".xlsx", ".zip"}
CHUNK_SIZE = 1024 * 1024


@router.post("")
async def upload_file(
    form_id: str,
    question_id: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    form = db.get(models.Form, form_id)
    if not form or form.status != models.FormStatus.published.value:
        raise HTTPException(status_code=404, detail="Form not found")

    question = next((q for q in form.questions if q.id == question_id), None)
    if not question or question.type != models.QuestionType.file_upload.value:
        raise HTTPException(status_code=400, detail="This question does not accept file uploads")

    original_name = file.filename or "upload"
    ext = Path(original_name).suffix.lower()
    if ext and ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=415, detail=f"\"{ext}\" files aren't allowed")

    # Read in bounded chunks rather than file.read() all at once, so an oversized upload
    # is rejected without first buffering the whole thing into memory.
    contents = bytearray()
    while True:
        chunk = await file.read(CHUNK_SIZE)
        if not chunk:
            break
        contents.extend(chunk)
        if len(contents) > MAX_FILE_SIZE:
            raise HTTPException(status_code=413, detail="File exceeds the 10 MB limit")

    stored_name = f"{uuid.uuid4().hex}{ext}"
    (UPLOAD_DIR / stored_name).write_bytes(contents)

    return {"file_name": original_name, "url": f"/uploads/{stored_name}", "size": len(contents)}
