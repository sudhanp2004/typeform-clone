# Typeform Clone

A functional clone of Typeform: a drag-and-drop form builder, a full-screen animated
one-question-at-a-time respondent experience, and a results dashboard with per-question
summary stats. Built for the SDE Fullstack take-home assignment.

## Tech stack

| Layer      | Choice                                                                 |
|------------|-------------------------------------------------------------------------|
| Frontend   | Next.js 16 (App Router, TypeScript), Tailwind CSS v4, Framer Motion, @dnd-kit |
| Backend    | FastAPI, SQLAlchemy 2.0, Pydantic v2                                    |
| Database   | SQLite                                                                   |

## Project structure

```
typeform-clone/
├── backend/
│   ├── app/
│   │   ├── models.py        # SQLAlchemy models
│   │   ├── schemas.py       # Pydantic request/response schemas
│   │   ├── database.py      # engine/session setup
│   │   ├── deps.py          # shared FastAPI dependencies (default creator, owned-form lookup)
│   │   ├── seed.py          # seeds sample forms + responses on first run
│   │   ├── main.py          # app entrypoint, CORS, router registration
│   │   └── routers/
│   │       ├── forms.py     # form CRUD, publish/unpublish, duplicate
│   │       ├── questions.py # question CRUD + reorder
│   │       ├── responses.py # creator-side results: list, detail, summary stats, CSV export
│   │       └── public.py    # unauthenticated form-fill + submit endpoints
│   └── requirements.txt
└── frontend/
    └── src/
        ├── app/
        │   ├── forms/                    # dashboard (list/create/duplicate/delete)
        │   ├── forms/[id]/edit/          # builder
        │   ├── forms/[id]/responses/     # results
        │   └── f/[id]/                   # public respondent flow (no auth)
        ├── components/
        │   ├── builder/                  # question list (dnd), editor canvas, type picker
        │   ├── respondent/                # welcome/question/thank-you screens, shared by
        │   │                              # both the public fill flow and the builder's
        │   │                              # "Preview" mode
        │   ├── results/                   # response table, summary cards, detail modal
        │   ├── dashboard/                 # form card
        │   └── ui/                        # Button, Modal, Input, Toast
        └── lib/                           # typed API client, shared types, validation
```

## Setup

### Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

The SQLite file (`typeform.db`) and its tables are created automatically on first run, and
the database is seeded with 2 published forms (mixed question types, several existing
responses) plus 1 draft form — as long as the `forms` table is empty. Delete `typeform.db`
to reseed from scratch.

API docs (Swagger UI): http://localhost:8000/docs

Set `FRONTEND_ORIGIN` (comma-separated for multiple) if the frontend isn't at
`http://localhost:3000` — it controls the CORS allow-list.

### Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local   # NEXT_PUBLIC_API_URL, defaults to http://localhost:8000
npm run dev
```

Open http://localhost:3000 — it redirects to `/forms`, the creator dashboard.

## Architecture overview

- **Auth is simplified per the assignment spec**: there's no login. Every creator-side
  request resolves to a single default creator (`app/deps.py::get_default_creator`),
  created lazily on first use. The public respondent routes (`/api/public/...`) require no
  authentication at all, since a published form's fill page has to work for anonymous
  visitors.
- **The builder canvas and the respondent flow share components.** `RespondentFlow` and its
  children (`QuestionScreen`, `AnswerField`, `WelcomeScreen`, `ThankYouScreen`) render both
  the real public fill page at `/f/[id]` *and* the builder's full-screen "Preview" overlay —
  the same code that answers a form is what a creator previews, so there's no drift between
  "what the builder shows" and "what respondents actually see."
- **Question ordering** is a plain integer `order_index` column, resequenced on every
  reorder/delete. The builder's drag-and-drop (`@dnd-kit`) computes the new id order
  client-side and sends it as one batch `PATCH .../questions/reorder` call rather than one
  request per moved question.
- **Answers are stored as raw JSON**, one row per (response, question) in the `answers`
  table, rather than a wide table with a column per question type — this keeps the schema
  stable as question types are added and lets `answers.value` hold a string, number, or
  boolean-as-string depending on the question, without a sparse/nullable column per type.
- **Partial-response tracking**: visiting a published form's fill page immediately creates a
  `Response` row (`is_complete=False`) via `POST /api/public/forms/{id}/responses`, before
  any question is answered. Submitting flips it to complete. This is what powers the
  "Total responses vs. Completed" stat on the results page — and it's also why the
  dashboard's response count only counts *completed* responses (an abandoned visit
  shouldn't inflate the number a creator sees).
- **Validation is duplicated by design, not by accident**: `frontend/src/lib/validation.ts`
  and `backend/app/routers/public.py::_validate_answer` implement the same rules (required,
  email format, number, rating range, valid choice) independently. The client-side check
  gives instant feedback per question; the server-side check is the actual source of truth
  and is what a malicious or buggy client can't bypass.

## Database schema

```
creators
├─ id (PK)
├─ name
└─ email (unique)

forms
├─ id (PK)
├─ creator_id (FK → creators.id)
├─ title, description
├─ status ("draft" | "published")
├─ theme, welcome_screen, thank_you_screen (JSON)
├─ created_at, updated_at, published_at
└─ (cascade-deletes questions + responses)

questions
├─ id (PK)
├─ form_id (FK → forms.id)
├─ type (short_text | long_text | multiple_choice | dropdown | email | number | yes_no | rating)
├─ title, description
├─ required (bool)
├─ order_index (int)
└─ options (JSON — e.g. {"choices": [...]} or {"max_rating": 5})

responses
├─ id (PK)
├─ form_id (FK → forms.id)
├─ is_complete (bool)
├─ started_at, submitted_at
└─ (cascade-deletes answers)

answers
├─ id (PK)
├─ response_id (FK → responses.id)
├─ question_id (FK → questions.id)
├─ value (JSON — raw string/number/bool depending on question type)
└─ created_at
```

Relationships: one creator → many forms; one form → many questions and many responses; one
response → many answers, one per answered question.

## API overview

Full interactive reference at `/docs` once the backend is running. Summary:

**Creator — forms** (`/api/forms`)
| Method | Path | Purpose |
|---|---|---|
| GET | `/api/forms` | List forms with status + completed response count |
| POST | `/api/forms` | Create a form (draft) |
| GET | `/api/forms/{id}` | Full form detail incl. ordered questions |
| PATCH | `/api/forms/{id}` | Rename, edit theme/screens, publish/unpublish |
| POST | `/api/forms/{id}/duplicate` | Duplicate a form and its questions |
| DELETE | `/api/forms/{id}` | Delete a form (cascades questions + responses) |

**Creator — questions** (`/api/forms/{id}/questions`)
| Method | Path | Purpose |
|---|---|---|
| POST | `/api/forms/{id}/questions` | Add a question |
| PATCH | `/api/forms/{id}/questions/reorder` | Bulk reorder (send full ordered id list) |
| PATCH | `/api/forms/{id}/questions/{qid}` | Edit a question |
| DELETE | `/api/forms/{id}/questions/{qid}` | Delete a question (resequences remaining) |

**Creator — results** (`/api/forms/{id}/responses`)
| Method | Path | Purpose |
|---|---|---|
| GET | `/api/forms/{id}/responses` | List responses |
| GET | `/api/forms/{id}/responses/summary` | Per-question counts/averages |
| GET | `/api/forms/{id}/responses/export` | CSV download |
| GET | `/api/forms/{id}/responses/{rid}` | Single response, full answer set |

**Public — respondent flow** (`/api/public/forms`, no auth)
| Method | Path | Purpose |
|---|---|---|
| GET | `/api/public/forms/{id}` | Published form + questions (404 if draft/missing) |
| POST | `/api/public/forms/{id}/responses` | Start a response (creates the partial-tracking row) |
| PATCH | `/api/public/forms/{id}/responses/{rid}` | Submit answers; validates required/email/number/choice/rating server-side |

## Assumptions & placeholders

- **Auth**: no login flow. The app always acts as one default creator, per the spec's
  "real creator authentication may be simplified" note.
- **Placeholders shown as "Coming soon"**: Payment and File upload question types (visible,
  disabled, in the type picker), advanced logic-jump branching, integrations/webhooks, and
  team collaboration — all explicitly out of scope per the assignment.
- **Bonus features implemented**: CSV export, partial-response/completion-rate tracking,
  per-form accent color theming (used live in both the builder canvas and the respondent
  flow). Logic jumps, dark mode, and the file-upload question type were left out to keep
  the core builder/respondent flow (the two pieces the assignment weights most) polished
  rather than spreading effort thin.
- **Seed data**: on first run against an empty database, the backend seeds 2 published
  forms (a customer feedback survey and a job application, covering all 8 question types
  between them) with several pre-existing responses each, plus 1 draft form — so the app is
  immediately explorable without manually building a form first.

## Deployment

- **Backend** → Render (or Railway): a Python web service running
  `uvicorn app.main:app --host 0.0.0.0 --port $PORT`, with a persistent disk mounted so
  `typeform.db` survives restarts. Set `FRONTEND_ORIGIN` to the deployed Vercel URL.
- **Frontend** → Vercel: set `NEXT_PUBLIC_API_URL` to the deployed backend URL.
