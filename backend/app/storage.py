from pathlib import Path

# Local disk storage for respondent file uploads. Same durability tradeoff as SQLite on
# Render's free tier (see README): this directory is wiped on every redeploy/cold start,
# which is an accepted limitation for a demo rather than a production file store.
UPLOAD_DIR = Path(__file__).resolve().parent.parent / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)
