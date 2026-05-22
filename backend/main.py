from __future__ import annotations

import os
import uuid
from typing import Literal

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from config import get_settings
from observability import load_observability, load_openai_client_class, safe_trace_url
from rag_service import RetrievedChunk, build_rag_service_from_env  # noqa: E402


class ChatMessage(BaseModel):
    role: Literal["system", "user", "assistant", "tool"]
    content: str | None = None


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1)
    history: list[ChatMessage] = Field(default_factory=list)
    session_id: str | None = None
    user_id: str | None = None


class Source(BaseModel):
    source: str
    title: str
    score: float
    text: str


class ChatResponse(BaseModel):
    answer: str
    sources: list[Source]
    trace_id: str | None = None
    trace_url: str | None = None
    retrieval_mode: str


settings = get_settings()
OpenAI = load_openai_client_class(settings)
langfuse, propagate_attributes = load_observability(settings)

app = FastAPI(title="FamLink RAG Backend")
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

rag_service = build_rag_service_from_env()
llm_client = OpenAI(
    base_url=settings.lm_studio_base_url,
    api_key=settings.lm_studio_api_key,
)


@app.get("/api/health")
def health() -> dict[str, str | int | bool]:
    return {
        "status": "ok",
        "model": settings.lm_studio_model,
        "documents": len(rag_service.list_documents()),
        "chunks": len(rag_service.chunks),
        "embedding_available": rag_service.embedding_available,
        "langfuse_configured": settings.langfuse_configured,
    }


@app.get("/api/documents")
def documents() -> list[dict[str, str | int]]:
    return rag_service.list_documents()


@app.post("/api/chat", response_model=ChatResponse)
def chat(request: ChatRequest) -> ChatResponse:
    session_id = request.session_id or str(uuid.uuid4())
    trace_id = langfuse.create_trace_id()

    with propagate_attributes(
        session_id=session_id,
        user_id=request.user_id,
        tags=["famlink", "rag", "chatbot"],
        trace_name="famlink-rag-chat",
        metadata={"rag_top_k": str(rag_service.top_k)},
    ):
        with langfuse.start_as_current_observation(
            as_type="span",
            name="famlink-rag-chat",
            trace_context={"trace_id": trace_id},
            input={"message": request.message},
            metadata={"session_id": session_id, "rag_top_k": rag_service.top_k},
        ) as span:
            with langfuse.start_as_current_observation(
                as_type="span",
                name="retrieve-knowledge",
                input={"query": request.message},
            ) as retrieval_span:
                retrieved = rag_service.retrieve(request.message)
                retrieval_span.update(
                    output=[
                        {
                            "source": item.chunk.source,
                            "title": item.chunk.title,
                            "score": round(item.score, 4),
                        }
                        for item in retrieved
                    ],
                    metadata={"mode": "embeddings" if rag_service.embedding_available else "lexical"},
                )

            context = rag_service.format_context(retrieved)
            messages = _build_messages(request, context)
            completion_args = {
                "model": settings.lm_studio_model,
                "messages": messages,
                "temperature": 0.4,
            }
            if settings.langfuse_configured:
                completion_args["name"] = "famlink-rag-generation"

            completion = llm_client.chat.completions.create(**completion_args)
            answer = completion.choices[0].message.content or ""

            span.update(output={"answer": answer, "source_count": len(retrieved)})
            source_models = [_to_source(item) for item in retrieved]
            return ChatResponse(
                answer=answer,
                sources=source_models,
                trace_id=trace_id,
                trace_url=safe_trace_url(langfuse, trace_id),
                retrieval_mode="embeddings" if rag_service.embedding_available else "lexical",
            )


def _build_messages(request: ChatRequest, context: str) -> list[dict[str, str]]:
    system_prompt = (
        "You are FamBot, a helpful family assistant for the FamLink app. "
        "Use the provided knowledge base context when answering health, child-care, and app questions. "
        "If the context does not answer the question, say that the knowledge base does not contain that detail. "
        "For urgent symptoms, advise contacting local emergency services or a pediatric clinician. "
        "Do not invent policies, diagnoses, dosages, or medical instructions that are not in the context."
    )
    messages: list[dict[str, str]] = [{"role": "system", "content": system_prompt}]

    for item in request.history[-8:]:
        if item.role in {"user", "assistant"} and item.content:
            messages.append({"role": item.role, "content": item.content})

    messages.append(
        {
            "role": "user",
            "content": f"Knowledge base context:\n{context or 'No relevant context found.'}\n\nUser question: {request.message}",
        }
    )
    return messages


def _to_source(item: RetrievedChunk) -> Source:
    return Source(
        source=item.chunk.source,
        title=item.chunk.title,
        score=round(item.score, 4),
        text=item.chunk.text[:500],
    )

