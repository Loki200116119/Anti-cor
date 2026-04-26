import json
import os
from typing import Any
from dotenv import load_dotenv

load_dotenv()

USE_OPENAI_AI = os.getenv("USE_OPENAI_AI", "false").lower() == "true"
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4.1-mini")


RISK_KEYWORDS = {
    "uz": ["pora", "pul", "tanish", "sovg'a", "sovga", "otkat", "navbat", "tezlashtirish"],
    "en": ["bribe", "cash", "payment", "unofficial", "kickback", "favor", "gift"],
    "ru": ["взятка", "деньги", "откат", "платеж", "знакомство", "подарок"],
}


def rule_based_analyze(report: dict[str, Any]) -> dict[str, Any]:
    description = (report.get("description") or "").strip()
    description_l = description.lower()
    category = (report.get("category") or "other").lower()
    location = (report.get("location") or "").strip()
    region = (report.get("region") or "").strip()
    organization = (report.get("organization") or "").strip()
    has_evidence = bool(report.get("has_evidence"))
    danger_flag = bool(report.get("danger_flag"))

    score = 10
    suggestions: list[str] = []

    if len(description) >= 200:
        score += 25
    elif len(description) >= 80:
        score += 20
    elif len(description) >= 30:
        score += 10
    else:
        suggestions.append("Tavsifni aniqroq yozing: nima bo'ldi, qachon, qayerda va kim ishtirok etdi?")

    if location or region:
        score += 15
    else:
        suggestions.append("Hudud yoki aniq joyni qo'shing.")

    if organization:
        score += 15
    else:
        suggestions.append("Agar bilsangiz, tashkilot nomini kiriting.")

    if has_evidence:
        score += 25
    else:
        suggestions.append("Agar xavfsiz bo'lsa, rasm, hujjat, audio yoki boshqa dalil qo'shing.")

    all_keywords = [w for words in RISK_KEYWORDS.values() for w in words]
    keyword_hits = sum(1 for word in all_keywords if word in description_l)
    score += min(keyword_hits * 5, 15)

    high_risk_categories = {"procurement", "construction", "medicine", "education", "public_services"}
    if category in high_risk_categories:
        score += 5

    if danger_flag:
        score += 5

    score = max(0, min(score, 100))

    completeness = 0
    completeness += 25 if len(description) >= 80 else 15 if description else 0
    completeness += 20 if location or region else 0
    completeness += 20 if organization else 0
    completeness += 20 if has_evidence else 0
    completeness += 15 if report.get("incident_date") else 0
    completeness = min(completeness, 100)

    if danger_flag or score >= 80:
        urgency = "high"
    elif score >= 55:
        urgency = "medium"
    else:
        urgency = "low"

    if has_evidence and completeness >= 75:
        evidence_strength = "high"
    elif has_evidence:
        evidence_strength = "medium"
    else:
        evidence_strength = "low"

    if score >= 80 and completeness >= 70:
        reward_potential = "strong"
    elif score >= 60 and completeness >= 50:
        reward_potential = "possible"
    else:
        reward_potential = "not_eligible_yet"

    summary = "Report structure was checked. AI found signals that require human moderator review."
    if score < 50:
        summary = "Report needs more specific facts before it can be reviewed effectively."

    return {
        "risk_score": score,
        "category": category,
        "urgency": urgency,
        "evidence_strength": evidence_strength,
        "completeness": completeness,
        "reward_potential": reward_potential,
        "suggestions": suggestions,
        "summary": summary,
        "next_step": "Moderator review" if score >= 50 else "More details recommended",
        "ai_mode": "rule_based",
    }


def _extract_json(text: str) -> dict[str, Any]:
    cleaned = text.strip()
    if cleaned.startswith("```"):
        cleaned = cleaned.strip("`")
        cleaned = cleaned.replace("json", "", 1).strip()
    start = cleaned.find("{")
    end = cleaned.rfind("}")
    if start >= 0 and end > start:
        cleaned = cleaned[start : end + 1]
    return json.loads(cleaned)


def openai_analyze(report: dict[str, Any]) -> dict[str, Any]:
    from openai import OpenAI

    client = OpenAI(api_key=OPENAI_API_KEY)
    prompt = f"""
You are an AI triage assistant for CleanSignal, an anti-corruption civic platform.
You never decide guilt and never say a case is proven. You only assess report structure, risk signals, evidence usefulness, and next steps for human review.
Return ONLY valid JSON.

Report:
category: {report.get('category')}
description: {report.get('description')}
location: {report.get('location')}
region: {report.get('region')}
organization: {report.get('organization')}
incident_date: {report.get('incident_date')}
has_evidence: {report.get('has_evidence')}
anonymous: {report.get('anonymous')}
danger_flag: {report.get('danger_flag')}

Return JSON exactly with these keys:
risk_score: integer 0-100
category: string
urgency: low | medium | high
evidence_strength: low | medium | high
completeness: integer 0-100
reward_potential: not_eligible_yet | possible | strong
suggestions: array of short strings
summary: short cautious string
next_step: short string
""".strip()

    response = client.responses.create(model=OPENAI_MODEL, input=prompt)
    data = _extract_json(response.output_text)
    data["ai_mode"] = "openai"
    return data


def analyze_report(report: dict[str, Any]) -> dict[str, Any]:
    if USE_OPENAI_AI and OPENAI_API_KEY:
        try:
            data = openai_analyze(report)
            required = ["risk_score", "category", "urgency", "evidence_strength", "completeness", "reward_potential", "suggestions", "next_step"]
            if not all(k in data for k in required):
                raise ValueError("OpenAI response missing required fields")
            return data
        except Exception as exc:
            fallback = rule_based_analyze(report)
            fallback["ai_mode"] = "fallback_after_openai_error"
            fallback["ai_error"] = str(exc)
            return fallback
    return rule_based_analyze(report)
