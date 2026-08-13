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
- **Completion rate**: the results page shows an overall `completed / total` percentage,
  plus a **"Completion by question" funnel** — for each question, the share of all
  responses that contain an answer for it, in form order. Under the existing
  `total_answers` figure already computed per question (`responses.py::response_summary`),
  this needs no extra backend work; it's a correct drop-off view precisely because a
  response only gets an answer recorded for a question once it's actually reached it, so a
  sharp drop between two questions is exactly where respondents are giving up.
- **Validation is duplicated by design, not by accident**: `frontend/src/lib/validation.ts`
  and `backend/app/routers/public.py::_validate_answer` implement the same rules (required,
  email format, number, rating range, valid choice) independently. The client-side check
  gives instant feedback per question; the server-side check is the actual source of truth
  and is what a malicious or buggy client can't bypass.
- **The dashboard's chrome mirrors the real Typeform admin's structure**: a top bar
  (organization/account avatars, a Forms/Contacts/Automations tab bar), a sort dropdown
  (Last updated / Date created / Name — all three genuinely re-sort the fetched list
  client-side) and a list/grid view toggle over the forms table. Contacts and Automations
  are shown as disabled tabs with a "Soon" badge rather than as buttons that do nothing on
  click, since this app has no backing feature for either — same honesty rule already
  applied to the Payment question type. The list view's "Completed" column is a real
  per-form completion rate (`FormListItem.total_response_count` vs. `response_count`,
  computed server-side in one query), not a static mockup value.

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
├─ type (short_text | long_text | multiple_choice | dropdown | email | number | yes_no | rating | file_upload)
├─ title, description
├─ required (bool)
├─ order_index (int)
├─ options (JSON — e.g. {"choices": [...]} or {"max_rating": 5})
└─ branching_rules (JSON — [{"value": <answer>, "target_question_id": <id | "end">}, ...])

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
| POST | `/api/public/forms/{id}/uploads` | Upload a file for a `file_upload` question (multipart) |

## Assumptions & placeholders

- **Auth**: no login flow. The app always acts as one default creator, per the spec's
  "real creator authentication may be simplified" note.
- **Placeholders shown as "Coming soon"**: the Payment question type (visible, disabled, in
  the type picker), integrations/webhooks, and team collaboration — all explicitly out of
  scope per the assignment.
- **Bonus features implemented**: logic jumps / conditional branching, custom themes, CSV
  export, partial-response/completion-rate tracking, and the file-upload question type (see
  below for details on each). Dark mode was left out to keep the core builder/respondent
  flow (the two pieces the assignment weights most) polished rather than spreading effort
  thin.

### Custom themes (colors, fonts, background)

Opened from the "Design" button in the builder toolbar. Three per-form settings, all
persisted on `Form.theme` (a JSON dict — `accent_color`, `background`, `font`) and applied
live everywhere a respondent (or the creator, while editing) actually sees the form:

- **Accent color** — used for the progress bar, required-field asterisk, selected-choice
  borders, and primary buttons (Start / OK / rating cells) throughout the respondent flow.
- **Background color** — a curated set of light/neutral presets, plus a native color picker
  for any custom value. Kept to light colors by default because the respondent flow's text
  color is fixed (not yet part of the theme system) — a very dark custom background is
  technically possible via the picker but is the creator's own call, the same tradeoff real
  Typeform makes.
- **Font** — a curated set of 5 typefaces (Inter, Poppins, Lora, Playfair Display, JetBrains
  Mono), each loaded at build time via `next/font/google` rather than fetched at runtime, so
  picking one never causes a flash of unstyled text or an extra network request per visitor.

Applied in three places: the public respondent page (`/f/[id]`), the builder's own
"Preview" overlay, and the builder's live-editing canvas itself — so a creator sees the
real theme while building, not just when previewing.

### Logic jumps / conditional branching

Available on Multiple choice, Dropdown, and Yes/No questions — for each possible answer,
the creator can route the respondent to any other question or straight to the end of the
form, overriding the default "next question in order" behavior. Configured from the
question's settings panel (the "Branching" section) in the builder.

This is enforced on both ends, not just presented visually:
- **Respondent flow** (`frontend/src/lib/branching.ts`): after each answer, resolves which
  question comes next client-side, so the fill experience actually skips/jumps rather than
  just displaying a graph.
- **Backend** (`backend/app/routers/public.py::_resolve_reachable_questions`): independently
  re-derives which questions a given answer set would have reached before enforcing "required"
  fields at submission — a required question skipped via branching correctly does *not*
  block submission, and this is verified server-side rather than trusted from the client.
- Deleting a question prunes any other question's branching rule that pointed at it, so
  branching can't silently reference a question that no longer exists.

The Workflow tab's node graph remains a visual, non-editable preview of the linear question
order (dragging nodes there doesn't persist or affect routing) — the actual branching logic
lives in the per-question settings panel described above.
- **Seed data**: on first run against an empty database, the backend seeds 2 published
  forms (a customer feedback survey and a job application, covering all 8 question types
  between them) with several pre-existing responses each, plus 1 draft form — so the app is
  immediately explorable without manually building a form first.

### File-upload question type

Respondents can attach a real file to a `file_upload` question — not a mock widget. Files
are sent as `multipart/form-data` (bypassing the frontend's default JSON request helper,
since a `FormData` body needs the browser to set its own boundary) to
`POST /api/public/forms/{id}/uploads`, which:
- validates the target form is published and the question is really type `file_upload`,
- rejects extensions outside a fixed allowlist and streams the upload in 1MB chunks so a
  10MB cap is enforced without buffering the whole file in memory first,
- saves it to `backend/uploads/` under a random filename (the original filename is kept only
  as display metadata, never used as the path on disk), and
- returns `{file_name, url, size}`, which becomes the question's answer value — stored as
  JSON in `answers.value` like any other answer, so no schema change was needed to support it.

Uploaded files are served back via a `StaticFiles` mount at `/uploads`, linked from both the
results page's response detail modal and the CSV export (as `name (url)`). In the builder's
Preview overlay — which can run against an unpublished draft, where the real endpoint would
reject the upload — file selection is faked locally with `URL.createObjectURL` instead of
hitting the network, consistent with the "Preview mode — responses aren't saved" messaging
already shown there.

Same durability caveat as the SQLite database (see Deployment below): Render's free tier has
no persistent disk, so `backend/uploads/` is wiped on every redeploy/cold start. Accepted as
a demo-scale tradeoff rather than solved with an external object store.

### Question settings panel (Max characters, Answer validation, Custom placeholder text)

The builder's right-hand question settings panel matches the real Typeform admin's control
set, with the same honesty rule applied to everything else in this app: controls that map to
a real feature are genuinely functional, and controls that would need a feature we don't
have (Map to contacts needs a Contacts system, Video needs video upload, Image or video and
Comments need their own subsystems) are shown disabled/"Soon" rather than as dead buttons.

Real, working controls (`short_text`/`long_text`/`number` only, shown conditionally per
type — a rating or multiple-choice question doesn't get a "Max characters" row):
- **Max characters** — caps a short/long text answer's length, enforced three times: the
  input's HTML `maxLength` (immediate truncation while typing), `lib/validation.ts`
  (pre-submit client check), and `public.py::_validate_answer` (the actual source of truth).
- **Answer validation** — for text questions, a format constraint (letters only / numbers
  only / letters and numbers); for number questions, a min/max value range. Same
  three-layer enforcement as above. This one is a best-effort reconstruction rather than a
  verified match to Typeform's own UI — I didn't have its expanded state in front of me, so
  the exact option set here is a reasonable guess, not a confirmed copy.
- **Custom placeholder text** — overrides the default "Type your answer here…" placeholder,
  reflected live in both the builder canvas preview and the actual respondent input.

All three persist through `Question.options` (the same free-form JSON column used for
`choices`/`max_rating`), so no schema migration was needed — just new keys
(`max_length`, `answer_format`, `min_value`, `max_value`, `placeholder`).

## Deployment

- **Backend → Render.** A `render.yaml` blueprint is included at the repo root: on Render,
  New → Blueprint → select this repo, and it configures the web service (build/start commands,
  health check) automatically. After deploying, set the `FRONTEND_ORIGIN` env var to the
  deployed Vercel URL (comma-separate multiple origins if needed) and redeploy.

  Note: Render's free plan doesn't support persistent disks, so `typeform.db` lives on the
  instance's ephemeral filesystem — it survives while the instance is running but resets on
  redeploy or after the free instance spins down from inactivity. The app reseeds itself
  automatically on an empty database, so it's always immediately usable after a cold start;
  the tradeoff is that responses submitted between cold starts aren't durable on the free
  tier. A paid Starter-plan instance (which supports Render's persistent disks) would fix
  this if durable storage is needed beyond a demo.
- **Frontend → Vercel.** Import this repo, set the project root to `frontend/`, and set
  `NEXT_PUBLIC_API_URL` to the deployed Render backend URL.

Deploy order matters for the env vars: deploy the backend first (get its URL), then the
frontend with `NEXT_PUBLIC_API_URL` pointing at it, then go back and set the backend's
`FRONTEND_ORIGIN` to the frontend's final URL and redeploy the backend once more so CORS allows it.
