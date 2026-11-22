
import json
import logging
import re
from typing import List

from openai import OpenAI, OpenAIError
from sqlalchemy.orm import Session

from ..config import settings
from ..models import Scheme
from ..schemas import AssistantQuery, AssistantResponse, AssistantCitation

logger = logging.getLogger(__name__)


class GroundedSchemeAssistant:

    @classmethod
    def answer_query(
        cls,
        query_in: AssistantQuery,
        db: Session
    ) -> AssistantResponse:

        # 1. Retrieve published government schemes
        query_builder = db.query(Scheme).filter(
            Scheme.status == "published"
        )

        if query_in.state_code:
            query_builder = query_builder.filter(
                (Scheme.state_code == query_in.state_code)
                | (Scheme.government_level == "central")
            )

        if query_in.category:
            query_builder = query_builder.filter(
                Scheme.category.ilike(f"%{query_in.category}%")
            )

        schemes = query_builder.all()

        # 2. Rank schemes against user requirements
        profile = query_in.profile or {}

        # Extract useful profile values as search terms
        profile_terms = []
        for key, value in profile.items():
            if value is None:
                continue
            if isinstance(value, bool):
                continue
            value = str(value).strip()
            if value:
                profile_terms.append(value)

        # Handle Telangana state code
        if profile.get("state_code") == "TG":
            profile_terms.append("Telangana")

        # Combine question and citizen profile
        search_text = " ".join([
            query_in.query,
            *profile_terms
        ]).lower()

        keywords = set(re.findall(r"\b\w{3,}\b", search_text))

        scored = []

        for scheme in schemes:
            rule_text = " ".join(
                rule.plain_language_text or ""
                for rule in (scheme.rules or [])
            )

            document_text = " ".join(
                doc.document_name or ""
                for doc in (scheme.documents or [])
            )

            searchable = " ".join([
                scheme.official_name or "",
                scheme.category or "",
                scheme.department or "",
                scheme.short_description or "",
                scheme.plain_language_description or "",
                scheme.benefit_summary or "",
                str(scheme.beneficiary_groups or ""),
                rule_text,
                document_text
            ]).lower()

            score = sum(
                5 if scheme.official_name and word in scheme.official_name.lower()
                else 1
                for word in keywords
                if word in searchable
            )

            if score > 0:
                scored.append((score, scheme))

        scored.sort(key=lambda item: item[0], reverse=True)

        # Select relevant scheme records
        selected = [item[1] for item in scored[:8]]


        # 3. Prepare verified database context
        scheme_context = []
        citations = []

        for scheme in selected:

            rules = [
                {
                    "condition": rule.plain_language_text,
                    "mandatory": rule.is_mandatory
                }
                for rule in (scheme.rules or [])
            ]

            documents = [
                doc.document_name
                for doc in (scheme.documents or [])
            ]

            source_urls = [
                source.official_url
                for source in (scheme.sources or [])
                if source.is_official
            ]

            scheme_context.append({
                "name": scheme.official_name,
                "category": scheme.category,
                "department": scheme.department,
                "description": scheme.plain_language_description,
                "benefits": scheme.benefit_summary,
                "eligibility_rules": rules,
                "required_documents": documents,
                "application_steps": scheme.application_steps,
                "official_url": scheme.official_application_url,
                "official_sources": source_urls,
                "verified_at": str(scheme.last_verified_at)
            })

            primary_url = (
                source_urls[0]
                if source_urls
                else scheme.official_application_url
            )

            citations.append(
                AssistantCitation(
                    scheme_name=scheme.official_name,
                    slug=scheme.slug,
                    department=scheme.department,
                    official_url=primary_url,
                    verified_at=scheme.last_verified_at,
                    excerpt=scheme.benefit_summary[:300]
                )
            )

        # 4. Build AI context
        context = {
            "citizen_profile": query_in.profile or {},
            "user_question": query_in.query,
            "available_verified_schemes": scheme_context
        }

        system_prompt = """
You are SchemeSathi AI, an intelligent Indian Government
Schemes Recommendation Assistant.

YOUR RESPONSIBILITIES:

1. Understand the citizen's requirements.
2. Identify relevant government schemes from the supplied database.
3. Analyze the citizen's profile against the published conditions.
4. Recommend potentially suitable schemes.
5. Explain benefits, conditions and required documents.
6. Explain the application process.
7. Ask follow-up questions when important information is missing.
8. Remember the conversation context supplied in chat history.

STRICT RULES:

- Use the supplied government scheme database as your
  factual source.
- Never invent scheme names, benefits, eligibility rules,
  deadlines or documents.
- Do not claim a person is officially eligible.
- Explain that recommendations are preliminary.
- Distinguish confirmed matches from missing information.
- If no relevant scheme exists in the supplied records,
  say so honestly.
- Never treat missing information as a failed condition.
- If scheme information is incomplete, disclose that.
- Use simple, understandable English.
- Be helpful, professional and conversational.

RESPONSE FORMAT:

## Understanding Your Requirements
Briefly explain what the citizen needs.

## Recommended Government Schemes
List relevant schemes and explain why they may fit.

## Eligibility Analysis
Explain matching conditions and information still needed.

## Documents Required
List only documents supported by the supplied records.

## How to Apply
Provide the recorded application steps and official links.

## Next Step
Ask one useful follow-up question if necessary.

IMPORTANT:
Only include sections that have sufficient evidence.
Never fabricate missing information.
"""

        # 5. If no matching records exist, don't fabricate recommendations.
        if not selected:
            context["available_verified_schemes"] = []

        # 6. Call OpenAI securely from the backend
        if not settings.OPENAI_API_KEY:
            return AssistantResponse(
                answer=(
                    "The AI service is not configured yet. "
                    "Please add OPENAI_API_KEY to your backend .env file."
                ),
                citations=citations,
                confidence="limited_info"
            )

        try:
            client = OpenAI(
                api_key=settings.OPENAI_API_KEY
            )

            messages = [
                {
                    "role": "system",
                    "content": system_prompt
                }
            ]

            # Keep recent conversation context
            for item in query_in.history[-8:]:
                role = item.get("role")
                content = item.get("content", "")

                if role in ("user", "assistant") and content:
                    messages.append({
                        "role": role,
                        "content": content[:3000]
                    })

            messages.append({
                "role": "user",
                "content": json.dumps(
                    context,
                    ensure_ascii=False,
                    default=str
                )
            })

            completion = client.chat.completions.create(
                model=settings.OPENAI_MODEL,
                messages=messages,
                temperature=0.2,
                max_tokens=1500
            )

            answer = (
                completion.choices[0].message.content
                or "I could not generate a response. Please try again."
            )

            return AssistantResponse(
                answer=answer,
                citations=citations,
                confidence=(
                    "grounded" if selected else "no_match"
                )
            )

        except OpenAIError as e:
            logger.error("OpenAI API error: %s", str(e))
            return AssistantResponse(
                answer=(
                    "The AI service is temporarily unavailable. "
                    "Please check your OPENAI_API_KEY in the backend .env file and try again."
                ),
                citations=citations,
                confidence="limited_info"
            )
        except Exception as e:
            logger.error("Unexpected error in assistant: %s", str(e))
            # Avoid exposing internal API errors or secrets.
            return AssistantResponse(
                answer=(
                    "The AI service is temporarily unavailable. "
                    "Please try again shortly."
                ),
                citations=citations,
                confidence="limited_info"
            )
