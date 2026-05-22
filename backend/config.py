from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path

from dotenv import load_dotenv


BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")


@dataclass(frozen=True)
class Settings:
    langfuse_public_key: str | None
    langfuse_secret_key: str | None
    langfuse_base_url: str
    lm_studio_base_url: str
    lm_studio_api_key: str
    lm_studio_model: str
    lm_studio_embedding_model: str | None
    knowledge_base_dir: Path
    rag_top_k: int
    cors_allow_origins: list[str]

    @property
    def langfuse_configured(self) -> bool:
        return bool(self.langfuse_public_key and self.langfuse_secret_key)


def get_settings() -> Settings:
    kb_dir = Path(os.getenv("RAG_KNOWLEDGE_BASE_DIR", "../knowledge_base"))
    if not kb_dir.is_absolute():
        kb_dir = (BASE_DIR / kb_dir).resolve()

    return Settings(
        langfuse_public_key=_optional_env("LANGFUSE_PUBLIC_KEY"),
        langfuse_secret_key=_optional_env("LANGFUSE_SECRET_KEY"),
        langfuse_base_url=os.getenv("LANGFUSE_BASE_URL", "https://cloud.langfuse.com"),
        lm_studio_base_url=os.getenv("LM_STUDIO_BASE_URL", "http://localhost:1234/v1"),
        lm_studio_api_key=os.getenv("LM_STUDIO_API_KEY", "lm-studio"),
        lm_studio_model=os.getenv("LM_STUDIO_MODEL", "qwen/qwen3-4b-2507"),
        lm_studio_embedding_model=_optional_env("LM_STUDIO_EMBEDDING_MODEL"),
        knowledge_base_dir=kb_dir,
        rag_top_k=int(os.getenv("RAG_TOP_K", "4")),
        cors_allow_origins=[
            origin.strip()
            for origin in os.getenv("CORS_ALLOW_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",")
            if origin.strip()
        ],
    )


def _optional_env(name: str) -> str | None:
    value = os.getenv(name)
    return value if value else None
