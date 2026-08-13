from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from app import models
from app.deps import DEFAULT_CREATOR_EMAIL

# ---------------------------------------------------------------------------
# Fixed IDs — hardcoded so URLs stay stable across every redeploy / reseed.
# Never change these; add new ones if you add new seed records.
# ---------------------------------------------------------------------------

CREATOR_ID = "00000000000000000000000000000001"

FEEDBACK_FORM_ID     = "aaaa0001000000000000000000000001"
JOB_APP_FORM_ID      = "aaaa0002000000000000000000000001"
DRAFT_FORM_ID        = "aaaa0003000000000000000000000001"

# Feedback form questions
FB_Q1  = "bbbb0001000000000000000000000001"  # name
FB_Q2  = "bbbb0001000000000000000000000002"  # email
FB_Q3  = "bbbb0001000000000000000000000003"  # how did you hear
FB_Q4  = "bbbb0001000000000000000000000004"  # rating
FB_Q5  = "bbbb0001000000000000000000000005"  # recommend
FB_Q6  = "bbbb0001000000000000000000000006"  # anything else

# Job application form questions
JA_Q1  = "bbbb0002000000000000000000000001"  # full name
JA_Q2  = "bbbb0002000000000000000000000002"  # email
JA_Q3  = "bbbb0002000000000000000000000003"  # years exp
JA_Q4  = "bbbb0002000000000000000000000004"  # strongest area
JA_Q5  = "bbbb0002000000000000000000000005"  # why join

# Draft form questions
DR_Q1  = "bbbb0003000000000000000000000001"
DR_Q2  = "bbbb0003000000000000000000000002"
DR_Q3  = "bbbb0003000000000000000000000003"

# Feedback responses
FB_R1  = "cccc0001000000000000000000000001"
FB_R2  = "cccc0001000000000000000000000002"
FB_R3  = "cccc0001000000000000000000000003"

# Job app responses
JA_R1  = "cccc0002000000000000000000000001"
JA_R2  = "cccc0002000000000000000000000002"


def seed_always(db: Session) -> None:
    """Wipe all data and reseed with fixed IDs on every startup.

    Using hardcoded IDs means bookmarked URLs (/forms/<id>/edit, /f/<id>)
    survive across reseeds and Render redeployments — the same form is
    always reachable at the same URL.
    """
    # Delete in FK-safe dependency order
    db.query(models.Answer).delete()
    db.query(models.Response).delete()
    db.query(models.Question).delete()
    db.query(models.Form).delete()
    db.query(models.Creator).delete()
    db.commit()

    creator = models.Creator(
        id=CREATOR_ID,
        name="Default Creator",
        email=DEFAULT_CREATOR_EMAIL,
    )
    db.add(creator)
    db.flush()

    _seed_feedback_form(db, creator)
    _seed_job_application_form(db, creator)
    _seed_draft_form(db, creator)

    db.commit()


# ---------------------------------------------------------------------------

def _seed_feedback_form(db: Session, creator: models.Creator) -> None:
    form = models.Form(
        id=FEEDBACK_FORM_ID,
        creator_id=creator.id,
        title="Customer Feedback Survey",
        description="Help us understand how we're doing.",
        status=models.FormStatus.published.value,
        form_mode="universal",
        theme={"accent_color": "#e0431f", "background": "#ffffff", "font": "inter"},
        welcome_screen={"title": "Quick feedback survey", "subtitle": "Takes about 2 minutes."},
        thank_you_screen={"title": "Thanks for your time!", "subtitle": "We read every response."},
        published_at=datetime.now(timezone.utc) - timedelta(days=5),
    )
    db.add(form)
    db.flush()

    questions = _add_questions(db, form, [
        (FB_Q1, "short_text",        "What's your name?",                      None,                                               True,  {}),
        (FB_Q2, "email",             "What's your email address?",              "We'll only use this to follow up if needed.",       True,  {}),
        (FB_Q3, "multiple_choice",   "How did you hear about us?",              None,                                               True,  {"choices": ["Search engine", "Social media", "Friend or colleague", "Advertisement"]}),
        (FB_Q4, "rating",            "How would you rate your overall experience?", None,                                           True,  {"max_rating": 5}),
        (FB_Q5, "yes_no",            "Would you recommend us to a friend?",     None,                                               True,  {}),
        (FB_Q6, "long_text",         "Anything else you'd like us to know?",    "Optional — be as detailed as you like.",            False, {}),
    ])

    _add_response(db, FB_R1, form, questions, {0: "Aditi Sharma",  1: "aditi.sharma@example.com", 2: "Friend or colleague", 3: 5, 4: "true",  5: "Loved how quick the whole process was."}, days_ago=4)
    _add_response(db, FB_R2, form, questions, {0: "Rahul Verma",   1: "rahul.v@example.com",      2: "Search engine",       3: 4, 4: "true",  5: ""}, days_ago=3)
    _add_response(db, FB_R3, form, questions, {0: "Meera Iyer",    1: "meera.iyer@example.com",   2: "Social media",        3: 3, 4: "false", 5: "Support response time could be faster."}, days_ago=1)


def _seed_job_application_form(db: Session, creator: models.Creator) -> None:
    form = models.Form(
        id=JOB_APP_FORM_ID,
        creator_id=creator.id,
        title="Frontend Engineer — Application",
        description="Apply for the Frontend Engineer role.",
        status=models.FormStatus.published.value,
        form_mode="universal",
        theme={"accent_color": "#2b6cb0", "background": "#ffffff", "font": "lora"},
        welcome_screen={"title": "Apply for Frontend Engineer", "subtitle": "5 quick questions."},
        thank_you_screen={"title": "Application received!", "subtitle": "We'll be in touch within a week."},
        published_at=datetime.now(timezone.utc) - timedelta(days=10),
    )
    db.add(form)
    db.flush()

    questions = _add_questions(db, form, [
        (JA_Q1, "short_text", "Full name",                                None,                               True,  {}),
        (JA_Q2, "email",      "Email address",                            None,                               True,  {}),
        (JA_Q3, "number",     "Years of professional experience",         None,                               True,  {}),
        (JA_Q4, "dropdown",   "Which best describes your strongest area?", None,                              True,  {"choices": ["React", "Vue", "Angular", "Vanilla JS / Web Components"]}),
        (JA_Q5, "long_text",  "Why do you want to join us?",              "A couple of sentences is plenty.", False, {}),
    ])

    _add_response(db, JA_R1, form, questions, {0: "Karan Mehta", 1: "karan.mehta@example.com", 2: 4, 3: "React", 4: "I've followed the product for years and love the design philosophy."}, days_ago=6)
    _add_response(db, JA_R2, form, questions, {0: "Priya Nair",  1: "priya.nair@example.com",  2: 2, 3: "Vue",   4: ""}, days_ago=2)


def _seed_draft_form(db: Session, creator: models.Creator) -> None:
    form = models.Form(
        id=DRAFT_FORM_ID,
        creator_id=creator.id,
        title="Event Registration (Draft)",
        description="Still being put together.",
        status=models.FormStatus.draft.value,
        form_mode="universal",
        theme={"accent_color": "#38a169", "background": "#ffffff", "font": "poppins"},
        welcome_screen={"title": "Register for the event", "subtitle": ""},
        thank_you_screen={"title": "You're registered!", "subtitle": ""},
    )
    db.add(form)
    db.flush()

    _add_questions(db, form, [
        (DR_Q1, "short_text", "Full name",                           None, True, {}),
        (DR_Q2, "email",      "Email address",                       None, True, {}),
        (DR_Q3, "yes_no",     "Will you be attending in person?",    None, True, {}),
    ])


# ---------------------------------------------------------------------------

def _add_questions(db: Session, form: models.Form, questions_data: list[tuple]) -> list[models.Question]:
    questions = []
    for index, (qid, qtype, title, description, required, options) in enumerate(questions_data):
        question = models.Question(
            id=qid,
            form_id=form.id,
            type=qtype,
            title=title,
            description=description,
            required=required,
            order_index=index,
            options=options,
        )
        db.add(question)
        questions.append(question)
    db.flush()
    return questions


def _add_response(
    db: Session,
    response_id: str,
    form: models.Form,
    questions: list[models.Question],
    answers_by_index: dict[int, object],
    days_ago: int,
) -> None:
    submitted_at = datetime.now(timezone.utc) - timedelta(days=days_ago)
    response = models.Response(
        id=response_id,
        form_id=form.id,
        is_complete=True,
        started_at=submitted_at,
        submitted_at=submitted_at,
    )
    db.add(response)
    db.flush()

    for index, value in answers_by_index.items():
        if value == "":
            continue
        db.add(models.Answer(
            response_id=response.id,
            question_id=questions[index].id,
            value=value,
        ))
