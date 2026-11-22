import datetime
from typing import Optional, List, Dict, Any, Union
from pydantic import BaseModel, ConfigDict, EmailStr, Field

# ----------------- Auth & User Schemas -----------------
class UserLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    email: str

class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: str
    role: str
    is_active: bool
    created_at: datetime.datetime

# ----------------- Scheme Sources & Documents -----------------
class SchemeSourceBase(BaseModel):
    source_title: str
    official_url: str
    source_type: str = "guideline_doc"
    verified_at: Optional[datetime.datetime] = None
    source_excerpt: Optional[str] = None
    is_official: bool = True

class SchemeSourceCreate(SchemeSourceBase):
    pass

class SchemeSourceResponse(SchemeSourceBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    scheme_id: int

class RequiredDocumentBase(BaseModel):
    document_name: str
    description: Optional[str] = None
    is_mandatory: bool = True
    source_id: Optional[int] = None

class RequiredDocumentCreate(RequiredDocumentBase):
    pass

class RequiredDocumentResponse(RequiredDocumentBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    scheme_id: int

# ----------------- Eligibility Rules -----------------
class EligibilityRuleBase(BaseModel):
    field_key: str
    operator: str  # equals, not_equals, greater_than, greater_than_or_equal, less_than, less_than_or_equal, between, in_list, contains, required_exists
    expected_value: str
    is_mandatory: bool = True
    plain_language_text: str
    source_id: Optional[int] = None
    effective_from: Optional[datetime.datetime] = None
    effective_to: Optional[datetime.datetime] = None
    version: int = 1

class EligibilityRuleCreate(EligibilityRuleBase):
    pass

class EligibilityRuleResponse(EligibilityRuleBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    scheme_id: int

# ----------------- Scheme Schemas -----------------
class SchemeBase(BaseModel):
    slug: str
    official_name: str
    short_description: str
    plain_language_description: str
    department: str
    government_level: str  # central, state
    state_code: Optional[str] = None  # e.g. TG
    category: str
    beneficiary_groups: Union[List[str], str]
    benefit_summary: str
    application_steps: Union[List[str], str]
    official_application_url: str
    status: str = "draft"  # draft, published, under_review, expired
    effective_from: Optional[datetime.datetime] = None
    effective_to: Optional[datetime.datetime] = None
    last_verified_at: Optional[datetime.datetime] = None
    is_demo: bool = False

class SchemeCreate(SchemeBase):
    rules: Optional[List[EligibilityRuleCreate]] = []
    documents: Optional[List[RequiredDocumentCreate]] = []
    sources: Optional[List[SchemeSourceCreate]] = []

class SchemeUpdate(BaseModel):
    slug: Optional[str] = None
    official_name: Optional[str] = None
    short_description: Optional[str] = None
    plain_language_description: Optional[str] = None
    department: Optional[str] = None
    government_level: Optional[str] = None
    state_code: Optional[str] = None
    category: Optional[str] = None
    beneficiary_groups: Optional[Union[List[str], str]] = None
    benefit_summary: Optional[str] = None
    application_steps: Optional[Union[List[str], str]] = None
    official_application_url: Optional[str] = None
    status: Optional[str] = None
    effective_from: Optional[datetime.datetime] = None
    effective_to: Optional[datetime.datetime] = None
    last_verified_at: Optional[datetime.datetime] = None
    is_demo: Optional[bool] = None
    rules: Optional[List[EligibilityRuleCreate]] = None
    documents: Optional[List[RequiredDocumentCreate]] = None
    sources: Optional[List[SchemeSourceCreate]] = None

class SchemeDetailResponse(SchemeBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime.datetime
    updated_at: datetime.datetime
    rules: List[EligibilityRuleResponse] = []
    documents: List[RequiredDocumentResponse] = []
    sources: List[SchemeSourceResponse] = []

class SchemeListItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    slug: str
    official_name: str
    short_description: str
    department: str
    government_level: str
    state_code: Optional[str] = None
    category: str
    beneficiary_groups: Union[List[str], str]
    benefit_summary: str
    official_application_url: str
    status: str
    last_verified_at: datetime.datetime
    is_demo: bool

# ----------------- Citizen Profile & Evaluation -----------------
class CitizenProfile(BaseModel):
    state_code: Optional[str] = Field(None, description="State code, e.g. TG for Telangana or CENTRAL")
    district: Optional[str] = Field(None, description="District name")
    age: Optional[Union[int, str]] = Field(None, description="Age in years")
    education_level: Optional[str] = Field(None, description="Education level, e.g., below_10th, 10th_pass, 12th_pass, graduate, post_graduate")
    occupation: Optional[str] = Field(None, description="Primary occupation, e.g. farmer, student, unemployed, salaried, artisan")
    annual_household_income: Optional[Union[int, float, str]] = Field(None, description="Annual household income in INR")
    student_status: Optional[Union[bool, str]] = Field(None, description="Whether currently enrolled as student")
    farmer_status: Optional[Union[bool, str]] = Field(None, description="Whether actively engaged in farming")
    landholding_acres: Optional[Union[float, int, str]] = Field(None, description="Agricultural landholding in acres")
    gender: Optional[str] = Field(None, description="Gender (optional): female, male, transgender, prefer_not_to_say")
    disability_status: Optional[Union[bool, str]] = Field(None, description="Disability status (optional)")
    social_category: Optional[str] = Field(None, description="Social category if required by specific scheme: sc, st, bc, minority, general")
    has_bpl_ration_card: Optional[Union[bool, str]] = Field(None, description="Holds BPL/White ration card or food security card")
    custom_attributes: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Additional custom answers")

class RuleEvaluationResult(BaseModel):
    rule_id: int
    field_key: str
    operator: str
    expected_value: str
    is_mandatory: bool
    plain_language_text: str
    evaluation_status: str  # MATCH, NO_MATCH, UNKNOWN, NEEDS_REVIEW
    reason: str
    source_title: Optional[str] = None
    official_url: Optional[str] = None

class SchemeMatchResult(BaseModel):
    scheme_id: int
    slug: str
    official_name: str
    short_description: str
    plain_language_description: str
    department: str
    category: str
    government_level: str
    state_code: Optional[str] = None
    is_demo: bool
    match_status: str  # POTENTIAL_MATCH, MORE_INFO_REQUIRED, NO_MATCH, NOT_ASSESSED
    status_label: str  # User friendly: Potential match, More information required, etc.
    recommendation_reason: str
    matched_rules: List[RuleEvaluationResult] = []
    unmatched_rules: List[RuleEvaluationResult] = []
    unknown_rules: List[RuleEvaluationResult] = []
    needs_review_rules: List[RuleEvaluationResult] = []
    benefit_summary: str
    application_steps: List[str] = []
    official_application_url: str
    last_verified_at: datetime.datetime
    required_documents: List[RequiredDocumentResponse] = []
    sources: List[SchemeSourceResponse] = []

class EvaluationResponse(BaseModel):
    total_schemes_evaluated: int
    potential_matches: List[SchemeMatchResult]
    more_info_required: List[SchemeMatchResult]
    no_matches: List[SchemeMatchResult]
    not_assessed: List[SchemeMatchResult]
    disclaimer: str = (
        "Preliminary eligibility screening only. This application does not decide official eligibility "
        "or guarantee approval. Final determination is made solely by the competent government authority."
    )

# ----------------- Assistant Q&A -----------------
class AssistantQuery(BaseModel):
    query: str
    state_code: Optional[str] = None
    category: Optional[str] = None
    profile: Optional[Dict[str, Any]] = None
    history: List[Dict[str, str]] = []

class AssistantCitation(BaseModel):
    scheme_name: str
    slug: str
    department: str
    official_url: str
    verified_at: datetime.datetime
    excerpt: str

class AssistantResponse(BaseModel):
    answer: str
    citations: List[AssistantCitation]
    confidence: str  # grounded, limited_info, no_match
    disclaimer: str = (
        "Information is grounded strictly in published official scheme records on SchemeSathi. "
        "Always confirm details at the official portal before taking action."
    )

# ----------------- Feedback -----------------
class FeedbackCreate(BaseModel):
    scheme_id: Optional[int] = None
    feedback_type: str  # broken_link, outdated_info, incorrect_details, translation_issue, general
    message: str

class FeedbackResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    scheme_id: Optional[int]
    feedback_type: str
    message: str
    created_at: datetime.datetime
    status: str

# ----------------- Admin Stats & Audit -----------------
class AdminDashboardStats(BaseModel):
    total_schemes: int
    published_schemes: int
    draft_schemes: int
    under_review_schemes: int
    expired_schemes: int
    demo_schemes: int
    total_feedback_pending: int
    last_updated_at: Optional[datetime.datetime] = None

class AuditLogResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    admin_user_id: Optional[int]
    action: str
    entity_type: str
    entity_id: Optional[int]
    timestamp: datetime.datetime
    change_summary: str
