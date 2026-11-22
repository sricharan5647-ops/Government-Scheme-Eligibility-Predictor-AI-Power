from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Scheme
from ..schemas import CitizenProfile, EvaluationResponse
from ..services.engine import EligibilityEngine

router = APIRouter(tags=["Eligibility"])

@router.post("/eligibility/evaluate", response_model=EvaluationResponse)
def evaluate_eligibility(profile: CitizenProfile, db: Session = Depends(get_db)):
    """
    Deterministic rule-based eligibility evaluation.
    Evaluates citizen's profile against all published schemes.
    Categorizes results into POTENTIAL_MATCH, MORE_INFO_REQUIRED, NO_MATCH, NOT_ASSESSED.
    """
    # Fetch all published schemes with relationships
    schemes = db.query(Scheme).filter(Scheme.status == "published").all()

    potential_matches = []
    more_info_required = []
    no_matches = []
    not_assessed = []

    for scheme in schemes:
        # If user specified a specific state (e.g. TG), central schemes apply + matching state schemes
        if profile.state_code and profile.state_code != "CENTRAL":
            if scheme.government_level == "state" and scheme.state_code != profile.state_code:
                # Different state scheme - not relevant
                continue

        result = EligibilityEngine.evaluate_scheme(scheme, profile)

        if result.match_status == "POTENTIAL_MATCH":
            potential_matches.append(result)
        elif result.match_status == "MORE_INFO_REQUIRED":
            more_info_required.append(result)
        elif result.match_status == "NO_MATCH":
            no_matches.append(result)
        else:
            not_assessed.append(result)

    # Rank results:
    # Within each group, schemes matching user's stated occupation/category come first
    def get_relevance_score(res):
        score = 0
        cat_lower = res.category.lower()
        if profile.occupation == "farmer" and "agri" in cat_lower:
            score += 10
        elif profile.occupation == "student" and "edu" in cat_lower:
            score += 10
        elif profile.farmer_status and "agri" in cat_lower:
            score += 8
        elif profile.student_status and "edu" in cat_lower:
            score += 8
        return score

    potential_matches.sort(key=get_relevance_score, reverse=True)
    more_info_required.sort(key=get_relevance_score, reverse=True)

    return EvaluationResponse(
        total_schemes_evaluated=len(schemes),
        potential_matches=potential_matches,
        more_info_required=more_info_required,
        no_matches=no_matches,
        not_assessed=not_assessed
    )
