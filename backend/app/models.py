import datetime
from sqlalchemy import (
    Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Index
)
from sqlalchemy.orm import relationship
from .database import Base

def utc_now() -> datetime.datetime:
    return datetime.datetime.now(datetime.timezone.utc)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), default="citizen", nullable=False)  # citizen, scheme_admin, platform_admin
    created_at = Column(DateTime, default=utc_now, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

    audit_logs = relationship("AuditLog", back_populates="admin_user")


class Scheme(Base):
    __tablename__ = "schemes"

    id = Column(Integer, primary_key=True, index=True)
    slug = Column(String(255), unique=True, index=True, nullable=False)
    official_name = Column(String(500), nullable=False)
    short_description = Column(Text, nullable=False)
    plain_language_description = Column(Text, nullable=False)
    department = Column(String(255), nullable=False)
    government_level = Column(String(50), nullable=False)  # central, state
    state_code = Column(String(10), nullable=True)  # e.g., 'TG' for Telangana, or None for Central
    category = Column(String(100), nullable=False)  # Education, Agriculture, Healthcare, Housing, etc.
    beneficiary_groups = Column(Text, nullable=False)  # JSON string or comma-separated list
    benefit_summary = Column(Text, nullable=False)
    application_steps = Column(Text, nullable=False)  # JSON string list of steps
    official_application_url = Column(String(1000), nullable=False)
    status = Column(String(50), default="draft", nullable=False)  # draft, published, under_review, expired
    effective_from = Column(DateTime, nullable=True)
    effective_to = Column(DateTime, nullable=True)
    last_verified_at = Column(DateTime, default=utc_now, nullable=False)
    is_demo = Column(Boolean, default=False, nullable=False)  # True if demo/sample data
    created_at = Column(DateTime, default=utc_now, nullable=False)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now, nullable=False)

    rules = relationship("EligibilityRule", back_populates="scheme", cascade="all, delete-orphan")
    documents = relationship("RequiredDocument", back_populates="scheme", cascade="all, delete-orphan")
    sources = relationship("SchemeSource", back_populates="scheme", cascade="all, delete-orphan")
    feedback = relationship("Feedback", back_populates="scheme")


class EligibilityRule(Base):
    __tablename__ = "eligibility_rules"

    id = Column(Integer, primary_key=True, index=True)
    scheme_id = Column(Integer, ForeignKey("schemes.id", ondelete="CASCADE"), nullable=False)
    field_key = Column(String(100), nullable=False)  # e.g. state_code, age, annual_household_income, etc.
    operator = Column(String(50), nullable=False)  # equals, not_equals, greater_than, etc.
    expected_value = Column(Text, nullable=False)  # Scalar string or JSON (for list/between)
    is_mandatory = Column(Boolean, default=True, nullable=False)
    plain_language_text = Column(Text, nullable=False)
    source_id = Column(Integer, ForeignKey("scheme_sources.id", ondelete="SET NULL"), nullable=True)
    effective_from = Column(DateTime, nullable=True)
    effective_to = Column(DateTime, nullable=True)
    version = Column(Integer, default=1, nullable=False)

    scheme = relationship("Scheme", back_populates="rules")
    source = relationship("SchemeSource")


class RequiredDocument(Base):
    __tablename__ = "required_documents"

    id = Column(Integer, primary_key=True, index=True)
    scheme_id = Column(Integer, ForeignKey("schemes.id", ondelete="CASCADE"), nullable=False)
    document_name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    is_mandatory = Column(Boolean, default=True, nullable=False)
    source_id = Column(Integer, nullable=True)

    scheme = relationship("Scheme", back_populates="documents")


class SchemeSource(Base):
    __tablename__ = "scheme_sources"

    id = Column(Integer, primary_key=True, index=True)
    scheme_id = Column(Integer, ForeignKey("schemes.id", ondelete="CASCADE"), nullable=False)
    source_title = Column(String(500), nullable=False)
    official_url = Column(String(1000), nullable=False)
    source_type = Column(String(100), default="guideline_doc", nullable=False)
    verified_at = Column(DateTime, default=utc_now, nullable=False)
    source_excerpt = Column(Text, nullable=True)
    is_official = Column(Boolean, default=True, nullable=False)

    scheme = relationship("Scheme", back_populates="sources")


class Feedback(Base):
    __tablename__ = "feedback"

    id = Column(Integer, primary_key=True, index=True)
    scheme_id = Column(Integer, ForeignKey("schemes.id", ondelete="SET NULL"), nullable=True)
    feedback_type = Column(String(50), nullable=False)  # broken_link, outdated_info, incorrect_details, translation_issue, general
    message = Column(Text, nullable=False)
    created_at = Column(DateTime, default=utc_now, nullable=False)
    status = Column(String(50), default="pending", nullable=False)

    scheme = relationship("Scheme", back_populates="feedback")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    admin_user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    action = Column(String(100), nullable=False)
    entity_type = Column(String(50), nullable=False)
    entity_id = Column(Integer, nullable=True)
    timestamp = Column(DateTime, default=utc_now, nullable=False)
    change_summary = Column(Text, nullable=False)

    admin_user = relationship("User", back_populates="audit_logs")
