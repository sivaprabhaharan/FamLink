from __future__ import annotations

import uuid
from contextlib import contextmanager
from typing import Any

from config import Settings


class NoopObservation:
    def update(self, **_: object) -> None:
        return None


class NoopLangfuse:
    def create_trace_id(self) -> str:
        return uuid.uuid4().hex

    @contextmanager
    def start_as_current_observation(self, **_: object):
        yield NoopObservation()

    def get_trace_url(self, trace_id: str) -> None:
        return None


@contextmanager
def noop_propagate_attributes(**_: object):
    yield


def load_observability(settings: Settings) -> tuple[Any, Any]:
    if settings.langfuse_configured:
        from langfuse import get_client, propagate_attributes

        return get_client(), propagate_attributes

    return NoopLangfuse(), noop_propagate_attributes


def load_openai_client_class(settings: Settings) -> Any:
    if settings.langfuse_configured:
        from langfuse.openai import OpenAI
    else:
        from openai import OpenAI

    return OpenAI


def safe_trace_url(langfuse: Any, trace_id: str) -> str | None:
    try:
        return langfuse.get_trace_url(trace_id=trace_id)
    except Exception:
        return None
