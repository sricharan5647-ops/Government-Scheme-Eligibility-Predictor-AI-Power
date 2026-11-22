import datetime
import pytest
from datetime import datetime , timezone
from backend.app.models import EligibilityRule, Scheme, SchemeSource
from backend.app.schemas import CitizenProfile
from backend.app.services.engine import EligibilityEngine, normalize_value, parse_expected_value

def create_mock_rule(
    field_key: str,
    operator: str,
    expected_value: str,
    is_mandatory: bool = True,
    effective_from = None,
    effective_to = None
) -> EligibilityRule:
    rule = EligibilityRule(
        id=1,
        scheme_id=1,
        field_key=field_key,
        operator=operator,
        expected_value=expected_value,
        is_mandatory=is_mandatory,
        plain_language_text=f"Rule: {field_key} {operator} {expected_value}",
        effective_from=effective_from,
        effective_to=effective_to,
        version=1
    )
    return rule

class TestRuleOperators:
    def test_equals_operator(self):
        rule = create_mock_rule("state_code", "equals", "TG")
        
        # Match
        res1 = EligibilityEngine.evaluate_rule(rule, CitizenProfile(state_code="TG"))
        assert res1.evaluation_status == "MATCH"
        
        # Case insensitive match
        res2 = EligibilityEngine.evaluate_rule(rule, CitizenProfile(state_code="tg"))
        assert res2.evaluation_status == "MATCH"

        # No match
        res3 = EligibilityEngine.evaluate_rule(rule, CitizenProfile(state_code="MH"))
        assert res3.evaluation_status == "NO_MATCH"

    def test_numeric_comparisons(self):
        gt_rule = create_mock_rule("age", "greater_than", "18")
        assert EligibilityEngine.evaluate_rule(gt_rule, CitizenProfile(age=19)).evaluation_status == "MATCH"
        assert EligibilityEngine.evaluate_rule(gt_rule, CitizenProfile(age=18)).evaluation_status == "NO_MATCH"
        assert EligibilityEngine.evaluate_rule(gt_rule, CitizenProfile(age=17)).evaluation_status == "NO_MATCH"

        lte_rule = create_mock_rule("annual_household_income", "less_than_or_equal", "500000")
        assert EligibilityEngine.evaluate_rule(lte_rule, CitizenProfile(annual_household_income=500000)).evaluation_status == "MATCH"
        assert EligibilityEngine.evaluate_rule(lte_rule, CitizenProfile(annual_household_income=250000)).evaluation_status == "MATCH"
        assert EligibilityEngine.evaluate_rule(lte_rule, CitizenProfile(annual_household_income=500001)).evaluation_status == "NO_MATCH"

    def test_between_operator(self):
        between_rule = create_mock_rule("age", "between", "18,35")
        assert EligibilityEngine.evaluate_rule(between_rule, CitizenProfile(age=18)).evaluation_status == "MATCH"
        assert EligibilityEngine.evaluate_rule(between_rule, CitizenProfile(age=25)).evaluation_status == "MATCH"
        assert EligibilityEngine.evaluate_rule(between_rule, CitizenProfile(age=35)).evaluation_status == "MATCH"
        assert EligibilityEngine.evaluate_rule(between_rule, CitizenProfile(age=17)).evaluation_status == "NO_MATCH"
        assert EligibilityEngine.evaluate_rule(between_rule, CitizenProfile(age=36)).evaluation_status == "NO_MATCH"

    def test_in_list_operator(self):
        in_list_rule = create_mock_rule("education_level", "in_list", "graduate,post_graduate")
        assert EligibilityEngine.evaluate_rule(in_list_rule, CitizenProfile(education_level="graduate")).evaluation_status == "MATCH"
        assert EligibilityEngine.evaluate_rule(in_list_rule, CitizenProfile(education_level="post_graduate")).evaluation_status == "MATCH"
        assert EligibilityEngine.evaluate_rule(in_list_rule, CitizenProfile(education_level="10th_pass")).evaluation_status == "NO_MATCH"

    def test_contains_operator(self):
        contains_rule = create_mock_rule("occupation", "contains", "farmer")
        assert EligibilityEngine.evaluate_rule(contains_rule, CitizenProfile(occupation="tenant_farmer")).evaluation_status == "MATCH"
        assert EligibilityEngine.evaluate_rule(contains_rule, CitizenProfile(occupation="student")).evaluation_status == "NO_MATCH"

    def test_unknown_and_missing_values(self):
        rule = create_mock_rule("annual_household_income", "less_than_or_equal", "300000")
        
        # Missing profile field -> UNKNOWN
        res_missing = EligibilityEngine.evaluate_rule(rule, CitizenProfile(annual_household_income=None))
        assert res_missing.evaluation_status == "UNKNOWN"

        # "Prefer not to say" or "unknown" input -> UNKNOWN
        res_pns = EligibilityEngine.evaluate_rule(rule, CitizenProfile(annual_household_income="prefer_not_to_say"))
        assert res_pns.evaluation_status == "UNKNOWN"

    def test_effective_dates_and_expiration(self):
        now = datetime.datetime(2025, 6, 1)
        
        # Expired rule
        expired_rule = create_mock_rule(
            "age", "greater_than", "18",
            effective_to=datetime.datetime(2024, 12, 31)
        )
        res_exp = EligibilityEngine.evaluate_rule(expired_rule, CitizenProfile(age=25), now=now)
        assert res_exp.evaluation_status == "EXPIRED"

        # Future rule (not yet active)
        future_rule = create_mock_rule(
            "age", "greater_than", "18",
            effective_from=datetime.datetime(2026, 1, 1)
        )
        res_fut = EligibilityEngine.evaluate_rule(future_rule, CitizenProfile(age=25), now=now)
        assert res_fut.evaluation_status == "NOT_APPLICABLE"


class TestSchemeEvaluationOutcomes:
    def test_potential_match(self):
        scheme = Scheme(
            id=1,
            slug="test-scheme",
            official_name="Test Scheme",
            short_description="Test short desc",
            plain_language_description="Test plain desc",
            department="Agriculture",
            government_level="state",
            state_code="TG",
            category="Agriculture",
            beneficiary_groups='["Farmers"]',
            benefit_summary="Assistance",
            application_steps='["Step 1"]',
            official_application_url="https://example.gov.in",
            status="published",
            is_demo=True,
            last_verified_at=datetime.datetime.utcnow(),
            rules=[
                create_mock_rule("state_code", "equals", "TG", is_mandatory=True),
                create_mock_rule("farmer_status", "equals", "true", is_mandatory=True),
            ]
        )
        
        profile = CitizenProfile(state_code="TG", farmer_status=True)
        outcome = EligibilityEngine.evaluate_scheme(scheme, profile)
        assert outcome.match_status == "POTENTIAL_MATCH"
        assert len(outcome.matched_rules) == 2
        assert len(outcome.unmatched_rules) == 0

    def test_more_info_required_when_mandatory_unknown(self):
        scheme = Scheme(
            id=1,
            slug="test-scheme",
            official_name="Test Scheme",
            short_description="Test",
            plain_language_description="Test",
            department="Agriculture",
            government_level="state",
            state_code="TG",
            category="Agriculture",
            beneficiary_groups='["Farmers"]',
            benefit_summary="Assistance",
            application_steps='["Step 1"]',
            official_application_url="https://example.gov.in",
            status="published",
            is_demo=True,
            last_verified_at=datetime.datetime.utcnow(),
            rules=[
                create_mock_rule("state_code", "equals", "TG", is_mandatory=True),
                create_mock_rule("annual_household_income", "less_than_or_equal", "200000", is_mandatory=True),
            ]
        )
        
        # User provides state TG, but income is unknown
        profile = CitizenProfile(state_code="TG", annual_household_income=None)
        outcome = EligibilityEngine.evaluate_scheme(scheme, profile)
        assert outcome.match_status == "MORE_INFO_REQUIRED"
        assert len(outcome.matched_rules) == 1
        assert len(outcome.unknown_rules) == 1

    def test_no_match_when_mandatory_fails(self):
        scheme = Scheme(
            id=1,
            slug="test-scheme",
            official_name="Test Scheme",
            short_description="Test",
            plain_language_description="Test",
            department="Agriculture",
            government_level="state",
            state_code="TG",
            category="Agriculture",
            beneficiary_groups='["Farmers"]',
            benefit_summary="Assistance",
            application_steps='["Step 1"]',
            official_application_url="https://example.gov.in",
            status="published",
            is_demo=True,
            last_verified_at=datetime.now(timezone.utc),
            rules=[
                create_mock_rule("state_code", "equals", "TG", is_mandatory=True),
                create_mock_rule("age", "greater_than_or_equal", "50", is_mandatory=True),
            ]
        )
        
        # User matches state TG, but age is 30 (fails mandatory condition)
        profile = CitizenProfile(state_code="TG", age=30)
        outcome = EligibilityEngine.evaluate_scheme(scheme, profile)
        assert outcome.match_status == "NO_MATCH"
        assert len(outcome.unmatched_rules) == 1
