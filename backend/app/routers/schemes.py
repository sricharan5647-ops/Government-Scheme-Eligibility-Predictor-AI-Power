import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Scheme
from ..schemas import SchemeListItemResponse, SchemeDetailResponse

router = APIRouter(tags=["Schemes"])

@router.get("/schemes", response_model=List[SchemeListItemResponse])
def list_schemes(
    q: Optional[str] = Query(None, description="Search query in name, department, or description"),
    category: Optional[str] = Query(None, description="Filter by category"),
    government_level: Optional[str] = Query(None, description="Filter by government level (central or state)"),
    state_code: Optional[str] = Query(None, description="Filter by state code, e.g. TG"),
    beneficiary_group: Optional[str] = Query(None, description="Filter by beneficiary group"),
    db: Session = Depends(get_db)
):
    """List published schemes available to the public."""
    query = db.query(Scheme).filter(Scheme.status == "published")

    if q:
        search = f"%{q.strip()}%"
        query = query.filter(
            (Scheme.official_name.ilike(search)) |
            (Scheme.department.ilike(search)) |
            (Scheme.short_description.ilike(search)) |
            (Scheme.category.ilike(search))
        )

    if category and category != "all":
        query = query.filter(Scheme.category.ilike(f"%{category}%"))

    if government_level and government_level != "all":
        query = query.filter(Scheme.government_level == government_level)

    if state_code and state_code != "all":
        query = query.filter(
            (Scheme.state_code == state_code) | (Scheme.government_level == "central")
        )

    if beneficiary_group and beneficiary_group != "all":
        query = query.filter(Scheme.beneficiary_groups.ilike(f"%{beneficiary_group}%"))

    schemes = query.order_by(Scheme.official_name.asc()).all()

    # Format beneficiary_groups and application_steps safely
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

@router.get("/schemes/{slug_or_id}", response_model=SchemeDetailResponse)
def get_scheme_detail(slug_or_id: str, db: Session = Depends(get_db)):
    """Retrieve full details of a specific scheme."""
    query = db.query(Scheme)
    if slug_or_id.isdigit():
        scheme = query.filter(Scheme.id == int(slug_or_id)).first()
    else:
        scheme = query.filter(Scheme.slug == slug_or_id).first()

    if not scheme:
        raise HTTPException(status_code=404, detail="Scheme not found")

    # Format JSON fields
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

@router.get("/categories")
def get_categories(db: Session = Depends(get_db)):
    """List categories with scheme counts."""
    schemes = db.query(Scheme).filter(Scheme.status == "published").all()
    counts = {}
    for s in schemes:
        cat = s.category
        counts[cat] = counts.get(cat, 0) + 1
    
    categories = [
        {"id": k, "name": k, "count": v} for k, v in sorted(counts.items())
    ]
    return categories

@router.get("/metadata")
def get_metadata():
    """Returns static lists for forms, filters, and questionnaires."""
    return {
        "categories": [
            "Agriculture & Allied",
            "Education & Learning",
            "Healthcare & Wellness",
            "Housing & Shelter",
            "Employment & Skills",
            "Women & Child Welfare",
            "Social Security & Welfare",
            "Entrepreneurship & Business"
        ],
        "states": [
            {"code": "TG", "name": "Telangana"},
            {"code": "CENTRAL", "name": "Central Government (All India)"}
        ],
        "districts_telangana": [
            "Adilabad", "Bhadradri Kothagudem", "Hyderabad", "Jagtial", "Jangaon",
            "Jayashankar Bhupalpally", "Jogulamba Gadwal", "Kamareddy", "Karimnagar",
            "Khammam", "Kumuram Bheem Asifabad", "Mahabubabad", "Mahabubnagar",
            "Mancherial", "Medak", "Medchal Malkajgiri", "Mulugu", "Nagarkurnool",
            "Nalgonda", "Narayanpet", "Nirmal", "Nizamabad", "Peddapalli",
            "Rajanna Sircilla", "Ranga Reddy", "Sangareddy", "Siddipet",
            "Suryapet", "Vikarabad", "Wanaparthy", "Warangal", "Hanamkonda", "Yadadri Bhuvanagiri"
        ],
        "education_levels": [
            {"value": "below_10th", "label": "Below 10th Standard"},
            {"value": "10th_pass", "label": "10th Standard / SSC Pass"},
            {"value": "12th_pass", "label": "12th Standard / Intermediate Pass"},
            {"value": "diploma", "label": "Diploma / ITI"},
            {"value": "graduate", "label": "Undergraduate / Bachelor's Degree"},
            {"value": "post_graduate", "label": "Postgraduate / Master's Degree or Higher"}
        ],
        "occupations": [
            {"value": "farmer", "label": "Farmer / Agricultural Landowner"},
            {"value": "agricultural_laborer", "label": "Agricultural Laborer / Tenant Farmer"},
            {"value": "student", "label": "Student"},
            {"value": "unemployed", "label": "Unemployed / Job Seeker"},
            {"value": "salaried", "label": "Salaried / Private Employee"},
            {"value": "self_employed", "label": "Self-Employed / Small Business"},
            {"value": "artisan", "label": "Artisan / Weaver / Traditional Craft"},
            {"value": "homemaker", "label": "Homemaker"},
            {"value": "retired", "label": "Retired / Senior Citizen"}
        ],
        "social_categories": [
            {"value": "sc", "label": "Scheduled Caste (SC)"},
            {"value": "st", "label": "Scheduled Tribe (ST)"},
            {"value": "bc", "label": "Backward Classes (BC)"},
            {"value": "minority", "label": "Religious Minority"},
            {"value": "general", "label": "General / Open Category"}
        ]
    }
