import pytest
from backend.app.database import SessionLocal
from backend.app.routers.schemes import list_schemes, get_scheme_detail, get_categories, get_metadata
from backend.app.routers.eligibility import evaluate_eligibility
from backend.app.routers.auth import admin_login
from backend.app.routers.admin import get_dashboard_stats, admin_list_schemes
from backend.app.routers.assistant import ask_assistant
from backend.app.routers.feedback import submit_feedback
from backend.app.schemas import CitizenProfile, UserLogin, AssistantQuery, FeedbackCreate
from backend.app.models import User

@pytest.fixture(scope="module")
def db():
    session = SessionLocal()
    yield session
    session.close()

def test_list_schemes_public(db):
    schemes = list_schemes(q=None, category=None, government_level=None, state_code=None, beneficiary_group=None, db=db)
    assert len(schemes) > 0
    for s in schemes:
        assert s.status == "published"
        assert s.official_name
        assert s.last_verified_at

def test_scheme_detail(db):
    scheme = get_scheme_detail("telangana-rythu-bandhu", db)
    assert scheme.slug == "telangana-rythu-bandhu"
    assert len(scheme.rules) > 0
    assert len(scheme.documents) > 0

def test_categories_and_metadata(db):
    cats = get_categories(db)
    assert len(cats) > 0
    meta = get_metadata()
    assert "categories" in meta
    assert "states" in meta

def test_eligibility_evaluation_endpoint(db):
    profile = CitizenProfile(
        state_code="TG",
        farmer_status=True,
        landholding_acres=2.5,
        age=35
    )
    result = evaluate_eligibility(profile, db)
    assert len(result.potential_matches) > 0
    matched_slugs = [s.slug for s in result.potential_matches]
    assert "telangana-rythu-bandhu" in matched_slugs

def test_admin_authentication_and_stats(db):
    # Valid login
    login_data = UserLogin(email="admin@schemesathi.in", password="Admin@SchemeSathi2025!")
    token_resp = admin_login(login_data, db)
    assert token_resp.access_token
    assert token_resp.role == "platform_admin"

    # Get admin user and verify dashboard stats
    admin_user = db.query(User).filter(User.email == "admin@schemesathi.in").first()
    stats = get_dashboard_stats(db, admin_user)
    assert stats.total_schemes > 0
    assert stats.published_schemes > 0

def test_feedback_submission(db):
    fb_in = FeedbackCreate(
        feedback_type="general",
        message="Testing public citizen feedback submission."
    )
    fb = submit_feedback(fb_in, db)
    assert fb.id is not None
    assert fb.status == "pending"

def test_grounded_assistant(db):
    query = AssistantQuery(
        query="What are the rules for farmer investment in Telangana?",
        state_code="TG"
    )
    res = ask_assistant(query, db)
    assert res.confidence == "grounded"
    assert len(res.citations) > 0
    assert "Rythu Bandhu" in res.answer
