from __future__ import annotations

import json
import os
import re
import sys
import time
import urllib.error
import urllib.request
from dataclasses import dataclass
from typing import Any

from config import get_settings
from observability import load_observability, load_openai_client_class


settings = get_settings()
BACKEND_URL = os.getenv("FAMLINK_BACKEND_URL", "http://localhost:8000/api")
OpenAI = load_openai_client_class(settings)


@dataclass(frozen=True)
class EvalCase:
    name: str
    query: str
    expected_sources: tuple[str, ...]


EVAL_CASES = [
    EvalCase("fever-red-flags", "My 2 year old has a 102 F fever and is very sleepy. What should I do?", ("childhood_fever.md",)),
    EvalCase("baby-fever", "My baby is 2 months old with a temperature of 100.4 F. Is that important?", ("childhood_fever.md",)),
    EvalCase("medicine-dose", "Can you calculate the fever medicine dose for my child?", ("medicine_safety.md",)),
    EvalCase("new-food-reaction", "After trying eggs my child has hives and vomiting. What should I watch for?", ("food_introduction.md",)),
    EvalCase("dehydration", "What are signs that my child is dehydrated after diarrhea?", ("dehydration_warning_signs.md",)),
    EvalCase("cough-breathing", "My child is coughing and ribs pull in when breathing. Is that urgent?", ("cough_and_breathing.md",)),
    EvalCase("rash", "What does FamLink say about a rash that does not fade when pressed?", ("rash_guidance.md",)),
    EvalCase("add-profile", "What fields are required to add a child profile?", ("child_profile_setup.md",)),
    EvalCase("bot-scope", "Can FamBot book an appointment with my pediatrician?", ("famlink_chatbot_scope.md", "appointment_preparation.md")),
    EvalCase("community-privacy", "What should I avoid posting in a FamLink community space?", ("community_guidelines.md",)),
    EvalCase("data-privacy", "Will chatbot tracing capture everything I type?", ("privacy_and_data.md",)),
    EvalCase("milestones", "Can FamBot diagnose a developmental delay?", ("developmental_milestones.md",)),
    EvalCase("school-notes", "What health notes should I prepare for daycare?", ("school_day_health.md",)),
    EvalCase("vaccine-schedule", "Can you tell me the exact vaccine schedule my child needs?", ("immunization_records.md",)),
    EvalCase("rag-policy", "How should FamBot behave when the knowledge base is missing an answer?", ("rag_response_policy.md",)),
]


def main() -> int:
    langfuse, _ = load_observability(settings)
    judge_client = OpenAI(
        base_url=settings.lm_studio_base_url,
        api_key=settings.lm_studio_api_key,
    )

    results = []
    for case in EVAL_CASES:
        response = call_chat(case.query)
        judgement = judge_response(judge_client, case, response)
        trace_id = response.get("trace_id")
        if trace_id:
            create_scores(langfuse, trace_id, judgement, case, response)
        results.append({"case": case.name, **judgement, "trace_id": trace_id})
        print(f"{case.name}: faithfulness={judgement['faithfulness']:.2f} relevance={judgement['answer_relevance']:.2f}")
        time.sleep(0.2)

    faithfulness = sum(item["faithfulness"] for item in results) / len(results)
    relevance = sum(item["answer_relevance"] for item in results) / len(results)
    print(json.dumps({"cases": len(results), "avg_faithfulness": faithfulness, "avg_answer_relevance": relevance}, indent=2))
    if hasattr(langfuse, "flush"):
        langfuse.flush()
    return 0


def call_chat(query: str) -> dict[str, Any]:
    payload = json.dumps({"message": query, "session_id": "famlink-eval"}).encode("utf-8")
    request = urllib.request.Request(
        f"{BACKEND_URL}/chat",
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=120) as response:
            return json.loads(response.read().decode("utf-8"))
    except urllib.error.URLError as exc:
        raise RuntimeError(f"Could not reach FamLink backend at {BACKEND_URL}. Start it with uvicorn first.") from exc


def judge_response(client: OpenAI, case: EvalCase, response: dict[str, Any]) -> dict[str, Any]:
    sources = response.get("sources", [])
    context = "\n\n".join(
        f"Source: {source.get('source')}\nTitle: {source.get('title')}\nText: {source.get('text')}"
        for source in sources
    )
    prompt = f"""
You are evaluating a RAG chatbot answer. Return only JSON with keys:
faithfulness, answer_relevance, context_relevance, notes.
Scores must be numbers from 0.0 to 1.0.

Question: {case.query}
Expected source files: {", ".join(case.expected_sources)}
Retrieved context:
{context}

Answer:
{response.get("answer", "")}
"""
    completion_args = {
        "model": settings.lm_studio_model,
        "messages": [
            {"role": "system", "content": "You are a strict evaluator. Output valid JSON only."},
            {"role": "user", "content": prompt},
        ],
        "temperature": 0,
    }
    if settings.langfuse_configured:
        completion_args["name"] = "famlink-rag-evaluator"

    completion = client.chat.completions.create(**completion_args)
    raw = completion.choices[0].message.content or "{}"
    data = parse_json(raw)
    retrieved_files = {source.get("source") for source in sources}
    expected_hit = any(expected in retrieved_files for expected in case.expected_sources)
    return {
        "faithfulness": clamp_float(data.get("faithfulness", 0.0)),
        "answer_relevance": clamp_float(data.get("answer_relevance", 0.0)),
        "context_relevance": clamp_float(data.get("context_relevance", 1.0 if expected_hit else 0.0)),
        "expected_source_hit": 1.0 if expected_hit else 0.0,
        "notes": str(data.get("notes", ""))[:500],
    }


def create_scores(langfuse: Any, trace_id: str, judgement: dict[str, Any], case: EvalCase, response: dict[str, Any]) -> None:
    for name in ("faithfulness", "answer_relevance", "context_relevance", "expected_source_hit"):
        langfuse.create_score(
            trace_id=trace_id,
            name=name,
            value=float(judgement[name]),
            data_type="NUMERIC",
            comment=f"Eval case: {case.name}",
        )
    if judgement.get("notes"):
        langfuse.create_score(
            trace_id=trace_id,
            name="evaluator_notes",
            value=judgement["notes"],
            data_type="TEXT",
            comment=f"Sources: {', '.join(source.get('source', '') for source in response.get('sources', []))}",
        )


def parse_json(text: str) -> dict[str, Any]:
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", text, flags=re.DOTALL)
        if not match:
            return {}
        try:
            return json.loads(match.group(0))
        except json.JSONDecodeError:
            return {}


def clamp_float(value: Any) -> float:
    try:
        number = float(value)
    except (TypeError, ValueError):
        return 0.0
    return min(1.0, max(0.0, number))


if __name__ == "__main__":
    sys.exit(main())
