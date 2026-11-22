export type GovernmentLevel = 'central' | 'state';
export type SchemeStatus = 'draft' | 'published' | 'under_review' | 'expired';
export type EvaluationStatus = 'MATCH' | 'NO_MATCH' | 'UNKNOWN' | 'NEEDS_REVIEW' | 'NOT_APPLICABLE' | 'EXPIRED';
export type MatchStatus = 'POTENTIAL_MATCH' | 'MORE_INFO_REQUIRED' | 'NO_MATCH' | 'NOT_ASSESSED';

export interface SchemeSource {
  id?: number;
  scheme_id?: number;
  source_title: string;
  official_url: string;
  source_type: string;
  verified_at?: string;
  source_excerpt?: string;
  is_official?: boolean;
}

export interface RequiredDocument {
  id?: number;
  scheme_id?: number;
  document_name: string;
  description?: string;
  is_mandatory: boolean;
  source_id?: number;
}

export interface EligibilityRule {
  id?: number;
  scheme_id?: number;
  field_key: string;
  operator: string;
  expected_value: string;
  is_mandatory: boolean;
  plain_language_text: string;
  source_id?: number;
  version?: number;
}

export interface Scheme {
  id: number;
  slug: string;
  official_name: string;
  short_description: string;
  plain_language_description?: string;
  department: string;
  government_level: GovernmentLevel;
  state_code?: string | null;
  category: string;
  beneficiary_groups: string[];
  benefit_summary: string;
  application_steps?: string[];
  official_application_url: string;
  status: SchemeStatus;
  effective_from?: string | null;
  effective_to?: string | null;
  last_verified_at: string;
  is_demo: boolean;
  rules?: EligibilityRule[];
  documents?: RequiredDocument[];
  sources?: SchemeSource[];
  created_at?: string;
  updated_at?: string;
}

export interface CitizenProfile {
  state_code?: string;
  district?: string;
  age?: number | string;
  education_level?: string;
  occupation?: string;
  annual_household_income?: number | string;
  student_status?: boolean | string;
  farmer_status?: boolean | string;
  landholding_acres?: number | string;
  gender?: string;
  disability_status?: boolean | string;
  social_category?: string;
  has_bpl_ration_card?: boolean | string;
  custom_attributes?: Record<string, any>;
}

export interface RuleEvaluationResult {
  rule_id: number;
  field_key: string;
  operator: string;
  expected_value: string;
  is_mandatory: boolean;
  plain_language_text: string;
  evaluation_status: EvaluationStatus;
  reason: string;
  source_title?: string;
  official_url?: string;
}

export interface SchemeMatchResult {
  scheme_id: number;
  slug: string;
  official_name: string;
  short_description: string;
  plain_language_description: string;
  department: string;
  category: string;
  government_level: GovernmentLevel;
  state_code?: string | null;
  is_demo: boolean;
  match_status: MatchStatus;
  status_label: string;
  recommendation_reason: string;
  matched_rules: RuleEvaluationResult[];
  unmatched_rules: RuleEvaluationResult[];
  unknown_rules: RuleEvaluationResult[];
  needs_review_rules: RuleEvaluationResult[];
  benefit_summary: string;
  application_steps: string[];
  official_application_url: string;
  last_verified_at: string;
  required_documents: RequiredDocument[];
  sources: SchemeSource[];
}

export interface EvaluationResponse {
  total_schemes_evaluated: number;
  potential_matches: SchemeMatchResult[];
  more_info_required: SchemeMatchResult[];
  no_matches: SchemeMatchResult[];
  not_assessed: SchemeMatchResult[];
  disclaimer: string;
}

export interface AssistantQuery {
  query: string;
  state_code?: string;
  category?: string;
  profile?: Record<string, any>;
  history?: {
    role: 'user' | 'assistant';
    content: string;
  }[];
}

export interface AssistantCitation {
  scheme_name: string;
  slug: string;
  department: string;
  official_url: string;
  verified_at: string;
  excerpt: string;
}

export interface AssistantResponse {
  answer: string;
  citations: AssistantCitation[];
  confidence: string;
  disclaimer: string;
}

export interface AdminStats {
  total_schemes: number;
  published_schemes: number;
  draft_schemes: number;
  under_review_schemes: number;
  expired_schemes: number;
  demo_schemes: number;
  total_feedback_pending: number;
  last_updated_at?: string;
}

export interface AuditLog {
  id: number;
  admin_user_id?: number;
  action: string;
  entity_type: string;
  entity_id?: number;
  timestamp: string;
  change_summary: string;
}
