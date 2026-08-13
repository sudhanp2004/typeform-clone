from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from app import models
from app.deps import DEFAULT_CREATOR_EMAIL


def seed_always(db: Session) -> None:
    """Wipe all data and reseed on every startup.

    Render's free tier uses an ephemeral filesystem — the SQLite file is wiped
    on every redeploy/cold-start, so always reseeding keeps the demo data
    consistent rather than presenting a mix of stale and fresh IDs.
    """
    # Delete in dependency order to satisfy FK constraints
    db.query(models.Answer).delete()
    db.query(models.Response).delete()
    db.query(models.Question).delete()
    db.query(models.Form).delete()
    db.query(models.Creator).delete()
    db.commit()

    creator = models.Creator(name="Default Creator", email=DEFAULT_CREATOR_EMAIL)
    db.add(creator)
    db.flush()

    _seed_feedback_form(db, creator)
    _seed_job_application_form(db, creator)
    _seed_draft_form(db, creator)

    db.commit()


def _seed_feedback_form(db: Session, creator: models.Creator) -> None:
    form = models.Form(
        creator_id=creator.id,
        title="Customer Feedback Survey",
        description="Help us understand how we're doing.",
        status=models.FormStatus.published.value,
        theme={"accent_color": "#e0431f", "background": "#ffffff", "font": "inter"},
        welcome_screen={"title": "Quick feedback survey", "subtitle": "Takes about 2 minutes."},
        thank_you_screen={"title": "Thanks for your time!", "subtitle": "We read every response."},
        published_at=datetime.now(timezone.utc) - timedelta(days=5),
    )
    db.add(form)
    db.flush()

    questions_data = [
        ("short_text", "What's your name?", None, True, {}),
        ("email", "What's your email address?", "We'll only use this to follow up if needed.", True, {}),
        (
            "multiple_choice",
            "How did you hear about us?",
            None,
            True,
            {"choices": ["Search engine", "Social media", "Friend or colleague", "Advertisement"]},
        ),
        (
            "rating",
            "How would you rate your overall experience?",
            None,
            True,
            {"max_rating": 5},
        ),
        ("yes_no", "Would you recommend us to a friend?", None, True, {}),
        ("long_text", "Anything else you'd like us to know?", "Optional — be as detailed as you like.", False, {}),
    ]
    questions = _add_questions(db, form, questions_data)

    _add_response(
        db,
        form,
        questions,
        {
            0: "Aditi Sharma",
            1: "aditi.sharma@example.com",
            2: "Friend or colleague",
            3: 5,
            4: "true",
            5: "Loved how quick the whole process was.",
        },
        days_ago=4,
    )
    _add_response(
        db,
        form,
        questions,
        {
            0: "Rahul Verma",
            1: "rahul.v@example.com",
            2: "Search engine",
            3: 4,
            4: "true",
            5: "",
        },
        days_ago=3,
    )
    _add_response(
        db,
        form,
        questions,
        {
            0: "Meera Iyer",
            1: "meera.iyer@example.com",
            2: "Social media",
            3: 3,
            4: "false",
            5: "Support response time could be faster.",
        },
        days_ago=1,
    )


def _seed_job_application_form(db: Session, creator: models.Creator) -> None:
    form = models.Form(
        creator_id=creator.id,
        title="Frontend Engineer — Application",
        description="Apply for the Frontend Engineer role.",
        status=models.FormStatus.published.value,
        theme={"accent_color": "#2b6cb0", "background": "#ffffff", "font": "lora"},
        welcome_screen={"title": "Apply for Frontend Engineer", "subtitle": "5 quick questions."},
        thank_you_screen={"title": "Application received!", "subtitle": "We'll be in touch within a week."},
        published_at=datetime.now(timezone.utc) - timedelta(days=10),
    )
    db.add(form)
    db.flush()

    questions_data = [
        ("short_text", "Full name", None, True, {}),
        ("email", "Email address", None, True, {}),
        ("number", "Years of professional experience", None, True, {}),
        (
            "dropdown",
            "Which best describes your strongest area?",
            None,
            True,
            {"choices": ["React", "Vue", "Angular", "Vanilla JS / Web Components"]},
        ),
        ("long_text", "Why do you want to join us?", "A couple of sentences is plenty.", False, {}),
    ]
    questions = _add_questions(db, form, questions_data)

    _add_response(
        db,
        form,
        questions,
        {
            0: "Karan Mehta",
            1: "karan.mehta@example.com",
            2: 4,
            3: "React",
            4: "I've followed the product for years and love the design philosophy.",
        },
        days_ago=6,
    )
    _add_response(
        db,
        form,
        questions,
        {
            0: "Priya Nair",
            1: "priya.nair@example.com",
            2: 2,
            3: "Vue",
            4: "",
        },
        days_ago=2,
    )


def _seed_draft_form(db: Session, creator: models.Creator) -> None:
    form = models.Form(
        creator_id=creator.id,
        title="Event Registration (Draft)",
        description="Still being put together.",
        status=models.FormStatus.draft.value,
        theme={"accent_color": "#38a169", "background": "#ffffff", "font": "poppins"},
        welcome_screen={"title": "Register for the event", "subtitle": ""},
        thank_you_screen={"title": "You're registered!", "subtitle": ""},
    )
    db.add(form)
    db.flush()

    _add_questions(
        db,
        form,
        [
            ("short_text", "Full name", None, True, {}),
            ("email", "Email address", None, True, {}),
            ("yes_no", "Will you be attending in person?", None, True, {}),
        ],
    )


def _add_questions(db: Session, form: models.Form, questions_data: list[tuple]) -> list[models.Question]:
    questions = []
    for index, (qtype, title, description, required, options) in enumerate(questions_data):
        question = models.Question(
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
    form: models.Form,
    questions: list[models.Question],
    answers_by_index: dict[int, object],
    days_ago: int,
) -> None:
    submitted_at = datetime.now(timezone.utc) - timedelta(days=days_ago)
    response = models.Response(
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
        db.add(models.Answer(response_id=response.id, question_id=questions[index].id, value=value))
