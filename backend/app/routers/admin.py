import json
import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Scheme, EligibilityRule, RequiredDocument, SchemeSource, User, AuditLog, Feedback
from ..schemas import (
    SchemeCreate, SchemeUpdate, SchemeDetailResponse, SchemeListItemResponse,
    AdminDashboardStats, AuditLogResponse, FeedbackResponse
)
from ..services.auth import require_admin

router = APIRouter(prefix="/admin", tags=["Admin"])

@router.get("/stats", response_model=AdminDashboardStats)
def get_dashboard_stats(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Retrieve statistical overview for administrator dashboard."""
    total = db.query(Scheme).count()
    published = db.query(Scheme).filter(Scheme.status == "published").count()
    draft = db.query(Scheme).filter(Scheme.status == "draft").count()
    under_review = db.query(Scheme).filter(Scheme.status == "under_review").count()
    expired = db.query(Scheme).filter(Scheme.status == "expired").count()
    demo = db.query(Scheme).filter(Scheme.is_demo == True).count()
    pending_fb = db.query(Feedback).filter(Feedback.status == "pending").count()
    
    last_scheme = db.query(Scheme).order_by(Scheme.updated_at.desc()).first()

    return AdminDashboardStats(
        total_schemes=total,
        published_schemes=published,
        draft_schemes=draft,
        under_review_schemes=under_review,
        expired_schemes=expired,
        demo_schemes=demo,
        total_feedback_pending=pending_fb,
        last_updated_at=last_scheme.updated_at if last_scheme else None
    )

@router.get("/schemes", response_model=List[SchemeListItemResponse])
def admin_list_schemes(
    status: Optional[str] = Query(None),
    q: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """List schemes for administration, including draft and expired records."""
    query = db.query(Scheme)
    if status and status != "all":
        query = query.filter(Scheme.status == status)
    if category and category != "all":
        query = query.filter(Scheme.category == category)
    if q:
        search = f"%{q.strip()}%"
        query = query.filter(
            (Scheme.official_name.ilike(search)) |
            (Scheme.department.ilike(search)) |
            (Scheme.slug.ilike(search))
        )
    
    schemes = query.order_by(Scheme.updated_at.desc()).all()
    results = []
    for s in schemes:
        bg = s.beneficiary_groups
        if isinstance(bg, str):
            try:
                bg = json.loads(bg)
            except Exception:
                bg = [x.strip() for x in bg.split(",") if x.strip()]

        results.append(SchemeListItemResponse(
            id=s.id,
            slug=s.slug,
            official_name=s.official_name,
            short_description=s.short_description,
            department=s.department,
            government_level=s.government_level,
            state_code=s.state_code,
            category=s.category,
            beneficiary_groups=bg,
            benefit_summary=s.benefit_summary,
            official_application_url=s.official_application_url,
            status=s.status,
            last_verified_at=s.last_verified_at,
            is_demo=s.is_demo
        ))
    return results

@router.post("/schemes", response_model=SchemeDetailResponse)
def create_scheme(
    scheme_in: SchemeCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Create a new scheme with structured rules, documents, and sources."""
    # Check slug uniqueness
    existing = db.query(Scheme).filter(Scheme.slug == scheme_in.slug).first()
    if existing:
        raise HTTPException(status_code=400, detail="A scheme with this URL slug already exists.")

    bg_str = json.dumps(scheme_in.beneficiary_groups) if isinstance(scheme_in.beneficiary_groups, list) else scheme_in.beneficiary_groups
    steps_str = json.dumps(scheme_in.application_steps) if isinstance(scheme_in.application_steps, list) else scheme_in.application_steps

    scheme = Scheme(
        slug=scheme_in.slug,
        official_name=scheme_in.official_name,
        short_description=scheme_in.short_description,
        plain_language_description=scheme_in.plain_language_description,
        department=scheme_in.department,
        government_level=scheme_in.government_level,
        state_code=scheme_in.state_code,
        category=scheme_in.category,
        beneficiary_groups=bg_str,
        benefit_summary=scheme_in.benefit_summary,
        application_steps=steps_str,
        official_application_url=scheme_in.official_application_url,
        status=scheme_in.status or "draft",
        effective_from=scheme_in.effective_from,
        effective_to=scheme_in.effective_to,
        last_verified_at=scheme_in.last_verified_at or datetime.datetime.now(datetime.timezone.utc),
        is_demo=scheme_in.is_demo,
        created_at=datetime.datetime.now(datetime.timezone.utc),
        updated_at=datetime.datetime.now(datetime.timezone.utc)
    )
    db.add(scheme)
    db.commit()
    db.refresh(scheme)

    # Add sources
    if scheme_in.sources:
        for src in scheme_in.sources:
            db_src = SchemeSource(
                scheme_id=scheme.id,
                source_title=src.source_title,
                official_url=src.official_url,
                source_type=src.source_type,
                verified_at=src.verified_at or datetime.datetime.now(datetime.timezone.utc),
                source_excerpt=src.source_excerpt,
                is_official=src.is_official
            )
            db.add(db_src)

    # Add rules
    if scheme_in.rules:
        for r in scheme_in.rules:
            db_rule = EligibilityRule(
                scheme_id=scheme.id,
                field_key=r.field_key,
                operator=r.operator,
                expected_value=r.expected_value,
                is_mandatory=r.is_mandatory,
                plain_language_text=r.plain_language_text,
                effective_from=r.effective_from,
                effective_to=r.effective_to,
                version=r.version or 1
            )
            db.add(db_rule)

    # Add documents
    if scheme_in.documents:
        for doc in scheme_in.documents:
            db_doc = RequiredDocument(
                scheme_id=scheme.id,
                document_name=doc.document_name,
                description=doc.description,
                is_mandatory=doc.is_mandatory
            )
            db.add(db_doc)

    # Record audit log
    audit = AuditLog(
        admin_user_id=admin.id,
        action="create_scheme",
        entity_type="scheme",
        entity_id=scheme.id,
        timestamp=datetime.datetime.now(datetime.timezone.utc),
        change_summary=f"Created scheme '{scheme.official_name}' with status '{scheme.status}'."
    )
    db.add(audit)
    db.commit()
    db.refresh(scheme)

    return scheme

@router.get("/schemes/{id}", response_model=SchemeDetailResponse)
def get_admin_scheme(
    id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    scheme = db.query(Scheme).filter(Scheme.id == id).first()
    if not scheme:
        raise HTTPException(status_code=404, detail="Scheme not found")
    
    bg = scheme.beneficiary_groups
    if isinstance(bg, str):
        try:
            bg = json.loads(bg)
        except Exception:
            bg = [x.strip() for x in bg.split(",") if x.strip()]

    steps = scheme.application_steps
    if isinstance(steps, str):
        try:
            steps = json.loads(steps)
        except Exception:
            steps = [x.strip() for x in steps.split("\n") if x.strip()]

    return SchemeDetailResponse(
        id=scheme.id,
        slug=scheme.slug,
        official_name=scheme.official_name,
        short_description=scheme.short_description,
        plain_language_description=scheme.plain_language_description,
        department=scheme.department,
        government_level=scheme.government_level,
        state_code=scheme.state_code,
        category=scheme.category,
        beneficiary_groups=bg,
        benefit_summary=scheme.benefit_summary,
        application_steps=steps,
        official_application_url=scheme.official_application_url,
        status=scheme.status,
        effective_from=scheme.effective_from,
        effective_to=scheme.effective_to,
        last_verified_at=scheme.last_verified_at,
        is_demo=scheme.is_demo,
        created_at=scheme.created_at,
        updated_at=scheme.updated_at,
        rules=scheme.rules,
        documents=scheme.documents,
        sources=scheme.sources
    )

@router.put("/schemes/{id}", response_model=SchemeDetailResponse)
def update_scheme(
    id: int,
    scheme_in: SchemeUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    scheme = db.query(Scheme).filter(Scheme.id == id).first()
    if not scheme:
        raise HTTPException(status_code=404, detail="Scheme not found")

    update_data = scheme_in.model_dump(exclude_unset=True)
    
    # Handle fields
    if "beneficiary_groups" in update_data and isinstance(update_data["beneficiary_groups"], list):
        scheme.beneficiary_groups = json.dumps(update_data["beneficiary_groups"])
    elif "beneficiary_groups" in update_data:
        scheme.beneficiary_groups = str(update_data["beneficiary_groups"])

    if "application_steps" in update_data and isinstance(update_data["application_steps"], list):
        scheme.application_steps = json.dumps(update_data["application_steps"])
    elif "application_steps" in update_data:
        scheme.application_steps = str(update_data["application_steps"])

    for field in ["slug", "official_name", "short_description", "plain_language_description",
                  "department", "government_level", "state_code", "category", "benefit_summary",
                  "official_application_url", "status", "effective_from", "effective_to",
                  "last_verified_at", "is_demo"]:
        if field in update_data and update_data[field] is not None:
            setattr(scheme, field, update_data[field])

    scheme.updated_at = datetime.datetime.now(datetime.timezone.utc)

    # If rules provided, replace them
    if scheme_in.rules is not None:
        db.query(EligibilityRule).filter(EligibilityRule.scheme_id == scheme.id).delete()
        for r in scheme_in.rules:
            db_rule = EligibilityRule(
                scheme_id=scheme.id,
                field_key=r.field_key,
                operator=r.operator,
                expected_value=r.expected_value,
                is_mandatory=r.is_mandatory,
                plain_language_text=r.plain_language_text,
                effective_from=r.effective_from,
                effective_to=r.effective_to,
                version=r.version or 1
            )
            db.add(db_rule)

    # If documents provided, replace them
    if scheme_in.documents is not None:
        db.query(RequiredDocument).filter(RequiredDocument.scheme_id == scheme.id).delete()
        for doc in scheme_in.documents:
            db_doc = RequiredDocument(
                scheme_id=scheme.id,
                document_name=doc.document_name,
                description=doc.description,
                is_mandatory=doc.is_mandatory
            )
            db.add(db_doc)

    # If sources provided, replace them
    if scheme_in.sources is not None:
        db.query(SchemeSource).filter(SchemeSource.scheme_id == scheme.id).delete()
        for src in scheme_in.sources:
            db_src = SchemeSource(
                scheme_id=scheme.id,
                source_title=src.source_title,
                official_url=src.official_url,
                source_type=src.source_type,
                verified_at=src.verified_at or datetime.datetime.now(datetime.timezone.utc),
                source_excerpt=src.source_excerpt,
                is_official=src.is_official
            )
            db.add(db_src)

    audit = AuditLog(
        admin_user_id=admin.id,
        action="update_scheme",
        entity_type="scheme",
        entity_id=scheme.id,
        timestamp=datetime.datetime.now(datetime.timezone.utc),
        change_summary=f"Updated details/rules for '{scheme.official_name}'."
    )
    db.add(audit)
    db.commit()
    db.refresh(scheme)
    return get_admin_scheme(id, db, admin)

@router.post("/schemes/{id}/publish")
def publish_scheme(
    id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    scheme = db.query(Scheme).filter(Scheme.id == id).first()
    if not scheme:
        raise HTTPException(status_code=404, detail="Scheme not found")

    scheme.status = "published"
    scheme.last_verified_at = datetime.datetime.now(datetime.timezone.utc)
    scheme.updated_at = datetime.datetime.now(datetime.timezone.utc)

    audit = AuditLog(
        admin_user_id=admin.id,
        action="publish_scheme",
        entity_type="scheme",
        entity_id=scheme.id,
        timestamp=datetime.datetime.now(datetime.timezone.utc),
        change_summary=f"Published scheme '{scheme.official_name}' with verified date {scheme.last_verified_at.strftime('%Y-%m-%d')}."
    )
    db.add(audit)
    db.commit()
    return {"message": "Scheme published successfully", "status": "published"}

@router.post("/schemes/{id}/archive")
def archive_scheme(
    id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    scheme = db.query(Scheme).filter(Scheme.id == id).first()
    if not scheme:
        raise HTTPException(status_code=404, detail="Scheme not found")

    scheme.status = "expired"
    scheme.updated_at = datetime.datetime.now(datetime.timezone.utc)

    audit = AuditLog(
        admin_user_id=admin.id,
        action="archive_scheme",
        entity_type="scheme",
        entity_id=scheme.id,
        timestamp=datetime.datetime.now(datetime.timezone.utc),
        change_summary=f"Archived / expired scheme '{scheme.official_name}'."
    )
    db.add(audit)
    db.commit()
    return {"message": "Scheme archived successfully", "status": "expired"}

@router.delete("/schemes/{id}")
def delete_scheme(
    id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    scheme = db.query(Scheme).filter(Scheme.id == id).first()
    if not scheme:
        raise HTTPException(status_code=404, detail="Scheme not found")

    name = scheme.official_name
    db.delete(scheme)
    audit = AuditLog(
        admin_user_id=admin.id,
        action="delete_scheme",
        entity_type="scheme",
        entity_id=id,
        timestamp=datetime.datetime.now(datetime.timezone.utc),
        change_summary=f"Deleted scheme '{name}'."
    )
    db.add(audit)
    db.commit()
    return {"message": f"Scheme '{name}' deleted successfully"}

@router.get("/audit-logs", response_model=List[AuditLogResponse])
def get_audit_logs(
    limit: int = 50,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    logs = db.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(limit).all()
    return logs

@router.get("/feedback", response_model=List[FeedbackResponse])
def get_feedback_list(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    fb = db.query(Feedback).order_by(Feedback.created_at.desc()).all()
    return fb
