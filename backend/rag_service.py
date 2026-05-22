from __future__ import annotations

import hashlib
import math
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable

from config import get_settings
from observability import load_openai_client_class


@dataclass(frozen=True)
class DocumentChunk:
    id: str
    source: str
    title: str
    text: str
    embedding: list[float] | None = None


@dataclass(frozen=True)
class RetrievedChunk:
    chunk: DocumentChunk
    score: float


TOKEN_RE = re.compile(r"[a-z0-9]+")


class RagService:
    def __init__(
        self,
        knowledge_base_dir: str | Path,
        lm_studio_base_url: str,
        lm_studio_api_key: str,
        embedding_model: str | None,
        top_k: int = 4,
        chunk_size: int = 900,
        chunk_overlap: int = 140,
    ) -> None:
        self.knowledge_base_dir = Path(knowledge_base_dir).resolve()
        self.embedding_model = embedding_model
        self.top_k = top_k
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        settings = get_settings()
        openai_client_class = load_openai_client_class(settings)
        self._openai = openai_client_class(base_url=lm_studio_base_url, api_key=lm_studio_api_key)
        self._chunks: list[DocumentChunk] = []
        self._embedding_available = bool(embedding_model)
        self.rebuild_index()

    @property
    def chunks(self) -> list[DocumentChunk]:
        return self._chunks

    @property
    def embedding_available(self) -> bool:
        return self._embedding_available

    def list_documents(self) -> list[dict[str, str | int]]:
        docs: list[dict[str, str | int]] = []
        for path in sorted(self.knowledge_base_dir.glob("*.md")):
            text = path.read_text(encoding="utf-8")
            docs.append(
                {
                    "source": path.name,
                    "title": self._extract_title(text, path),
                    "characters": len(text),
                }
            )
        return docs

    def rebuild_index(self) -> None:
        raw_chunks = list(self._load_chunks())
        if self.embedding_model:
            try:
                embeddings = self._embed([chunk.text for chunk in raw_chunks])
                self._chunks = [
                    DocumentChunk(
                        id=chunk.id,
                        source=chunk.source,
                        title=chunk.title,
                        text=chunk.text,
                        embedding=embedding,
                    )
                    for chunk, embedding in zip(raw_chunks, embeddings, strict=True)
                ]
                self._embedding_available = True
                return
            except Exception:
                self._embedding_available = False

        self._chunks = raw_chunks

    def retrieve(self, query: str, top_k: int | None = None) -> list[RetrievedChunk]:
        if not self._chunks:
            return []

        limit = top_k or self.top_k
        if self._embedding_available and self.embedding_model:
            try:
                query_embedding = self._embed([query])[0]
                scored = [
                    RetrievedChunk(chunk=chunk, score=_cosine_similarity(query_embedding, chunk.embedding or []))
                    for chunk in self._chunks
                ]
            except Exception:
                scored = self._lexical_retrieve(query)
        else:
            scored = self._lexical_retrieve(query)

        return sorted(scored, key=lambda item: item.score, reverse=True)[:limit]

    def format_context(self, retrieved: Iterable[RetrievedChunk]) -> str:
        sections = []
        for item in retrieved:
            sections.append(
                f"[Source: {item.chunk.source} | {item.chunk.title} | score={item.score:.3f}]\n"
                f"{item.chunk.text}"
            )
        return "\n\n---\n\n".join(sections)

    def _load_chunks(self) -> Iterable[DocumentChunk]:
        for path in sorted(self.knowledge_base_dir.glob("*.md")):
            text = path.read_text(encoding="utf-8")
            title = self._extract_title(text, path)
            body = text.strip()
            for index, chunk_text in enumerate(_split_text(body, self.chunk_size, self.chunk_overlap)):
                chunk_id = hashlib.sha256(f"{path.name}:{index}:{chunk_text}".encode("utf-8")).hexdigest()[:16]
                yield DocumentChunk(id=chunk_id, source=path.name, title=title, text=chunk_text)

    def _embed(self, texts: list[str]) -> list[list[float]]:
        if not self.embedding_model:
            raise RuntimeError("No embedding model configured.")
        response = self._openai.embeddings.create(model=self.embedding_model, input=texts)
        return [item.embedding for item in response.data]

    def _lexical_retrieve(self, query: str) -> list[RetrievedChunk]:
        query_terms = _term_counts(query)
        scored = []
        for chunk in self._chunks:
            doc_terms = _term_counts(chunk.text)
            scored.append(RetrievedChunk(chunk=chunk, score=_cosine_counts(query_terms, doc_terms)))
        return scored

    @staticmethod
    def _extract_title(text: str, path: Path) -> str:
        for line in text.splitlines():
            if line.startswith("# "):
                return line[2:].strip()
        return path.stem.replace("_", " ").title()


def _split_text(text: str, chunk_size: int, chunk_overlap: int) -> Iterable[str]:
    normalized = re.sub(r"\n{3,}", "\n\n", text).strip()
    start = 0
    while start < len(normalized):
        end = min(start + chunk_size, len(normalized))
        if end < len(normalized):
            boundary = normalized.rfind("\n\n", start, end)
            if boundary > start + chunk_size // 2:
                end = boundary
        yield normalized[start:end].strip()
        if end >= len(normalized):
            break
        start = max(0, end - chunk_overlap)


def _term_counts(text: str) -> dict[str, float]:
    counts: dict[str, float] = {}
    for token in TOKEN_RE.findall(text.lower()):
        if len(token) < 3:
            continue
        counts[token] = counts.get(token, 0.0) + 1.0
    return counts


def _cosine_counts(left: dict[str, float], right: dict[str, float]) -> float:
    if not left or not right:
        return 0.0
    dot = sum(value * right.get(term, 0.0) for term, value in left.items())
    left_norm = math.sqrt(sum(value * value for value in left.values()))
    right_norm = math.sqrt(sum(value * value for value in right.values()))
    return dot / (left_norm * right_norm) if left_norm and right_norm else 0.0


def _cosine_similarity(left: list[float], right: list[float]) -> float:
    if not left or not right or len(left) != len(right):
        return 0.0
    dot = sum(a * b for a, b in zip(left, right, strict=True))
    left_norm = math.sqrt(sum(value * value for value in left))
    right_norm = math.sqrt(sum(value * value for value in right))
    return dot / (left_norm * right_norm) if left_norm and right_norm else 0.0


def build_rag_service_from_env() -> RagService:
    settings = get_settings()

    return RagService(
        knowledge_base_dir=settings.knowledge_base_dir,
        lm_studio_base_url=settings.lm_studio_base_url,
        lm_studio_api_key=settings.lm_studio_api_key,
        embedding_model=settings.lm_studio_embedding_model,
        top_k=settings.rag_top_k,
    )
