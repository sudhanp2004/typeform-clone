import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.database import Base, SessionLocal, engine
from app.routers import forms, public, questions, responses, uploads
from app.seed import seed_if_empty
from app.storage import UPLOAD_DIR

Base.metadata.create_all(bind=engine)

with SessionLocal() as db:
    seed_if_empty(db)

app = FastAPI(title="Typeform Clone API", version="1.0.0")

allowed_origins = os.getenv("FRONTEND_ORIGIN", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(forms.router)
app.include_router(questions.router)
app.include_router(responses.router)
app.include_router(public.router)
app.include_router(uploads.router)

app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")


@app.get("/api/health")
def health_check():
    return {"status": "ok"}
