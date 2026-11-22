import json
import datetime
from typing import Any, Dict, List, Optional, Tuple
from ..models import EligibilityRule, Scheme
from ..schemas import CitizenProfile, RuleEvaluationResult, SchemeMatchResult

def normalize_value(val: Any) -> Any:
    """Normalize input values for clean comparison."""
    if val is None:
        return None
    if isinstance(val, str):
        cleaned = val.strip().lower()
        if cleaned in ("", "none", "null", "prefer_not_to_say", "unknown", "i_dont_know", "not_sure"):
            return None
        if cleaned in ("true", "yes", "1"):
            return True
        if cleaned in ("false", "no", "0"):
            return False
        # Try numeric conversion
        try:
            if "." in cleaned:
                return float(cleaned)
            return int(cleaned)
        except ValueError:
            return cleaned
    return val

def parse_expected_value(expected_raw: str, operator: str) -> Any:
    """Parse expected value which may be scalar, json array, or comma-separated string."""
    if expected_raw is None:
        return None
    raw_str = str(expected_raw).strip()
    
    # Try parsing as JSON first
    try:
        parsed = json.loads(raw_str)
        if operator in ("in_list", "contains") and isinstance(parsed, list):
            return [normalize_value(x) for x in parsed]
        if operator == "between" and isinstance(parsed, list) and len(parsed) == 2:
            return [normalize_value(parsed[0]), normalize_value(parsed[1])]
    except Exception:
        pass

    # If operator is in_list or contains and not JSON, split by comma
    if operator in ("in_list", "contains") and "," in raw_str:
        return [normalize_value(x.strip()) for x in raw_str.split(",")]

    if operator == "between" and "," in raw_str:
        parts = [normalize_value(x.strip()) for x in raw_str.split(",")]
        if len(parts) >= 2:
            return [parts[0], parts[1]]

    return normalize_value(raw_str)

def get_profile_value(profile: CitizenProfile, field_key: str) -> Any:
    """Extract field value from standard fields or custom attributes."""
    if hasattr(profile, field_key):
        val = getattr(profile, field_key)
        if val is not None:
            return normalize_value(val)
    
    if profile.custom_attributes and field_key in profile.custom_attributes:
        return normalize_value(profile.custom_attributes[field_key])
        
    return None

def get_utc_now() -> datetime.datetime:
    return datetime.datetime.now(datetime.timezone.utc)

def normalize_dt(dt: Optional[datetime.datetime]) -> Optional[datetime.datetime]:
    if dt is None:
        return None
    if dt.tzinfo is None:
        return dt.replace(tzinfo=datetime.timezone.utc)
    return dt

class EligibilityEngine:
    """
    Deterministic rule evaluation engine adhering to SchemeSathi specification.
    Never hallucinates or guesses. Distinguishes MATCH, NO_MATCH, UNKNOWN, NEEDS_REVIEW.
    """

    @classmethod
    def evaluate_rule(
        cls, 
        rule: EligibilityRule, 
        profile: CitizenProfile,
        now: Optional[datetime.datetime] = None
    ) -> RuleEvaluationResult:
        if now is None:
            now = get_utc_now()
        else:
            now = normalize_dt(now)

        eff_from = normalize_dt(rule.effective_from)
        eff_to = normalize_dt(rule.effective_to)

        # Check rule effective dates
        if eff_from and now < eff_from:
            return RuleEvaluationResult(
                rule_id=rule.id,
                field_key=rule.field_key,
                operator=rule.operator,
                expected_value=str(rule.expected_value),
                is_mandatory=rule.is_mandatory,
                plain_language_text=rule.plain_language_text,
                evaluation_status="NOT_APPLICABLE",
                reason="Rule is not yet effective as of today.",
                source_title=rule.source.source_title if rule.source else None,
                official_url=rule.source.official_url if rule.source else None
            )

        if eff_to and now > eff_to:
            return RuleEvaluationResult(
                rule_id=rule.id,
                field_key=rule.field_key,
                operator=rule.operator,
                expected_value=str(rule.expected_value),
                is_mandatory=rule.is_mandatory,
                plain_language_text=rule.plain_language_text,
                evaluation_status="EXPIRED",
                reason="Rule validity expired on " + eff_to.strftime("%Y-%m-%d"),
                source_title=rule.source.source_title if rule.source else None,
                official_url=rule.source.official_url if rule.source else None
            )

        user_val = get_profile_value(profile, rule.field_key)
        expected_val = parse_expected_value(rule.expected_value, rule.operator)

        # Handle UNKNOWN cases where user provided no answer
        if user_val is None:
            return RuleEvaluationResult(
                rule_id=rule.id,
                field_key=rule.field_key,
                operator=rule.operator,
                expected_value=str(rule.expected_value),
                is_mandatory=rule.is_mandatory,
                plain_language_text=rule.plain_language_text,
                evaluation_status="UNKNOWN",
                reason=f"No answer provided for '{rule.field_key}'. Please provide this to assess eligibility.",
                source_title=rule.source.source_title if rule.source else None,
                official_url=rule.source.official_url if rule.source else None
            )

        # Check for explicit NEEDS_REVIEW operator or conditions requiring official inspection
        if rule.operator == "needs_review":
            return RuleEvaluationResult(
                rule_id=rule.id,
                field_key=rule.field_key,
                operator=rule.operator,
                expected_value=str(rule.expected_value),
                is_mandatory=rule.is_mandatory,
                plain_language_text=rule.plain_language_text,
                evaluation_status="NEEDS_REVIEW",
                reason="Requires physical verification or certificate submission to the department.",
                source_title=rule.source.source_title if rule.source else None,
                official_url=rule.source.official_url if rule.source else None
            )

        # Evaluate standard operators
        status = "NO_MATCH"
        reason = ""

        try:
            op = rule.operator.lower()
            if op in ("equals", "eq", "=="):
                if user_val == expected_val:
                    status = "MATCH"
                    reason = f"Matches requirement ({user_val})."
                else:
                    status = "NO_MATCH"
                    reason = f"Your value ({user_val}) does not match expected ({expected_val})."

            elif op in ("not_equals", "neq", "!="):
                if user_val != expected_val:
                    status = "MATCH"
                    reason = f"Matches requirement ({user_val} != {expected_val})."
                else:
                    status = "NO_MATCH"
                    reason = f"Value ({user_val}) matches excluded value ({expected_val})."

            elif op in ("greater_than", "gt", ">"):
                if isinstance(user_val, (int, float)) and isinstance(expected_val, (int, float)):
                    if user_val > expected_val:
                        status = "MATCH"
                        reason = f"Value {user_val} is greater than minimum {expected_val}."
                    else:
                        status = "NO_MATCH"
                        reason = f"Value {user_val} is not greater than {expected_val}."
                else:
                    status = "UNKNOWN"
                    reason = "Cannot perform numeric comparison on non-numeric input."

            elif op in ("greater_than_or_equal", "gte", ">="):
                if isinstance(user_val, (int, float)) and isinstance(expected_val, (int, float)):
                    if user_val >= expected_val:
                        status = "MATCH"
                        reason = f"Value {user_val} meets minimum requirement of {expected_val}."
                    else:
                        status = "NO_MATCH"
                        reason = f"Value {user_val} is below minimum requirement of {expected_val}."
                else:
                    status = "UNKNOWN"
                    reason = "Cannot perform numeric comparison on non-numeric input."

            elif op in ("less_than", "lt", "<"):
                if isinstance(user_val, (int, float)) and isinstance(expected_val, (int, float)):
                    if user_val < expected_val:
                        status = "MATCH"
                        reason = f"Value {user_val} is within required limit (under {expected_val})."
                    else:
                        status = "NO_MATCH"
                        reason = f"Value {user_val} exceeds maximum limit of {expected_val}."
                else:
                    status = "UNKNOWN"
                    reason = "Cannot perform numeric comparison on non-numeric input."

            elif op in ("less_than_or_equal", "lte", "<="):
                if isinstance(user_val, (int, float)) and isinstance(expected_val, (int, float)):
                    if user_val <= expected_val:
                        status = "MATCH"
                        reason = f"Value {user_val} satisfies maximum limit of {expected_val}."
                    else:
                        status = "NO_MATCH"
                        reason = f"Value {user_val} exceeds upper threshold of {expected_val}."
                else:
                    status = "UNKNOWN"
                    reason = "Cannot perform numeric comparison on non-numeric input."

            elif op == "between":
                if isinstance(expected_val, list) and len(expected_val) == 2:
                    min_v, max_v = expected_val[0], expected_val[1]
                    if isinstance(user_val, (int, float)) and isinstance(min_v, (int, float)) and isinstance(max_v, (int, float)):
                        if min_v <= user_val <= max_v:
                            status = "MATCH"
                            reason = f"Value {user_val} is within range [{min_v}, {max_v}]."
                        else:
                            status = "NO_MATCH"
                            reason = f"Value {user_val} is outside allowed range [{min_v}, {max_v}]."
                    else:
                        status = "UNKNOWN"
                        reason = "Between operator requires numeric boundaries."
                else:
                    status = "UNKNOWN"
                    reason = "Invalid between definition in rule."

            elif op in ("in_list", "in"):
                if isinstance(expected_val, list):
                    if user_val in expected_val:
                        status = "MATCH"
                        reason = f"Category '{user_val}' is in eligible list."
                    else:
                        status = "NO_MATCH"
                        reason = f"Value '{user_val}' is not in approved list ({', '.join(str(x) for x in expected_val)})."
                else:
                    if user_val == expected_val:
                        status = "MATCH"
                        reason = f"Matched {user_val}."
                    else:
                        status = "NO_MATCH"
                        reason = f"Not matching {expected_val}."

            elif op in ("contains", "has"):
                # E.g. expected_val contained in user_val or vice-versa
                if isinstance(user_val, list):
                    if expected_val in user_val:
                        status = "MATCH"
                        reason = f"Contains '{expected_val}'."
                    else:
                        status = "NO_MATCH"
                        reason = f"Does not contain '{expected_val}'."
                elif isinstance(user_val, str) and isinstance(expected_val, str):
                    if expected_val.lower() in user_val.lower():
                        status = "MATCH"
                        reason = f"'{user_val}' contains required keyword '{expected_val}'."
                    else:
                        status = "NO_MATCH"
                        reason = f"'{user_val}' does not contain '{expected_val}'."
                else:
                    status = "NO_MATCH"
                    reason = "Value does not match required condition."

            elif op in ("required_exists", "exists"):
                if user_val is not None and user_val is not False:
                    status = "MATCH"
                    reason = f"Requirement verified ({user_val})."
                else:
                    status = "NO_MATCH"
                    reason = "Mandatory requirement not present."

            else:
                status = "UNKNOWN"
                reason = f"Unsupported rule operator '{rule.operator}'."

        except Exception as e:
            status = "UNKNOWN"
            reason = f"Error evaluating condition: {str(e)}"

        return RuleEvaluationResult(
            rule_id=rule.id,
            field_key=rule.field_key,
            operator=rule.operator,
            expected_value=str(rule.expected_value),
            is_mandatory=rule.is_mandatory,
            plain_language_text=rule.plain_language_text,
            evaluation_status=status,
            reason=reason,
            source_title=rule.source.source_title if rule.source else None,
            official_url=rule.source.official_url if rule.source else None
        )

    @classmethod
    def evaluate_scheme(
        cls, 
        scheme: Scheme, 
        profile: CitizenProfile,
        now: Optional[datetime.datetime] = None
    ) -> SchemeMatchResult:
        if now is None:
            now = get_utc_now()
        else:
            now = normalize_dt(now)

        # Parse application steps and beneficiary groups safely
        app_steps = []
        if scheme.application_steps:
            if isinstance(scheme.application_steps, list):
                app_steps = scheme.application_steps
            else:
                try:
                    app_steps = json.loads(scheme.application_steps)
                except Exception:
                    app_steps = [s.strip() for s in scheme.application_steps.split("\n") if s.strip()]

        matched_rules = []
        unmatched_rules = []
        unknown_rules = []
        needs_review_rules = []

        rules = scheme.rules or []
        active_rules = [r for r in rules if (not r.effective_to or normalize_dt(r.effective_to) >= now)]

        if not active_rules:
            # Scheme has no rules defined -> NOT_ASSESSED
            return SchemeMatchResult(
                scheme_id=scheme.id,
                slug=scheme.slug,
                official_name=scheme.official_name,
                short_description=scheme.short_description,
                plain_language_description=scheme.plain_language_description,
                department=scheme.department,
                category=scheme.category,
                government_level=scheme.government_level,
                state_code=scheme.state_code,
                is_demo=scheme.is_demo,
                match_status="NOT_ASSESSED",
                status_label="Not assessed",
                recommendation_reason="Insufficient structured rule data available for automatic assessment.",
                matched_rules=[],
                unmatched_rules=[],
                unknown_rules=[],
                needs_review_rules=[],
                benefit_summary=scheme.benefit_summary,
                application_steps=app_steps,
                official_application_url=scheme.official_application_url,
                last_verified_at=scheme.last_verified_at,
                required_documents=scheme.documents or [],
                sources=scheme.sources or []
            )

        for rule in active_rules:
            eval_res = cls.evaluate_rule(rule, profile, now)
            if eval_res.evaluation_status == "MATCH":
                matched_rules.append(eval_res)
            elif eval_res.evaluation_status == "NO_MATCH":
                unmatched_rules.append(eval_res)
            elif eval_res.evaluation_status == "UNKNOWN":
                unknown_rules.append(eval_res)
            elif eval_res.evaluation_status == "NEEDS_REVIEW":
                needs_review_rules.append(eval_res)

        # Mandatory checks
        mandatory_unmatched = [r for r in unmatched_rules if r.is_mandatory]
        mandatory_unknown = [r for r in unknown_rules if r.is_mandatory]
        mandatory_needs_review = [r for r in needs_review_rules if r.is_mandatory]
        mandatory_matched = [r for r in matched_rules if r.is_mandatory]
        total_mandatory = len([r for r in active_rules if r.is_mandatory])

        # Scheme-level outcome decision logic according to spec 7.4:
        # 1. NO_MATCH: At least one mandatory rule is a confirmed no-match.
        # 2. MORE_INFO_REQUIRED: At least one mandatory rule is unknown or needs review, and no mandatory rule is confirmed no-match.
        # 3. POTENTIAL_MATCH: All mandatory machine-checkable rules match and no mandatory rule is unknown or needs review.
        # 4. NOT_ASSESSED: Insufficient rules.
        
        if mandatory_unmatched:
            match_status = "NO_MATCH"
            status_label = "Does not appear to match listed criteria"
            unmatched_names = ", ".join([r.field_key for r in mandatory_unmatched[:2]])
            recommendation_reason = f"Criteria not satisfied: {unmatched_names}."
        elif mandatory_unknown or mandatory_needs_review:
            match_status = "MORE_INFO_REQUIRED"
            status_label = "More information required"
            missing_items = []
            if mandatory_unknown:
                missing_items.append(f"{len(mandatory_unknown)} missing detail(s)")
            if mandatory_needs_review:
                missing_items.append(f"{len(mandatory_needs_review)} requirement(s) requiring document/department verification")
            recommendation_reason = f"Potential fit pending: {', '.join(missing_items)}."
        elif total_mandatory > 0 and len(mandatory_matched) == total_mandatory:
            match_status = "POTENTIAL_MATCH"
            status_label = "Potential match"
            recommendation_reason = f"Satisfies all {total_mandatory} mandatory eligibility criteria listed in official guidelines."
        else:
            match_status = "POTENTIAL_MATCH"
            status_label = "Potential match"
            recommendation_reason = "Satisfies applicable criteria based on submitted profile."

        return SchemeMatchResult(
            scheme_id=scheme.id,
            slug=scheme.slug,
            official_name=scheme.official_name,
            short_description=scheme.short_description,
            plain_language_description=scheme.plain_language_description,
            department=scheme.department,
            category=scheme.category,
            government_level=scheme.government_level,
            state_code=scheme.state_code,
            is_demo=scheme.is_demo,
            match_status=match_status,
            status_label=status_label,
            recommendation_reason=recommendation_reason,
            matched_rules=matched_rules,
            unmatched_rules=unmatched_rules,
            unknown_rules=unknown_rules,
            needs_review_rules=needs_review_rules,
            benefit_summary=scheme.benefit_summary,
            application_steps=app_steps,
            official_application_url=scheme.official_application_url,
            last_verified_at=scheme.last_verified_at,
            required_documents=scheme.documents or [],
            sources=scheme.sources or []
        )
