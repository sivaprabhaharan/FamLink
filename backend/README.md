# FamLink RAG Backend

This FastAPI service adds RAG, LM Studio calls, Langfuse tracing, and evaluation scores for FamBot.

## Setup

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
```

Fill `backend/.env` with your Langfuse keys and LM Studio settings. Keep `backend/.env` local; it is ignored by git.

## Run

Start LM Studio on `http://localhost:1234/v1`, then run:

```powershell
uvicorn main:app --reload --port 8000
```

Useful endpoints:

- `GET /api/health`
- `GET /api/documents`
- `POST /api/chat`

## Evaluate

With the backend running:

```powershell
python run_evals.py
```

The eval runner sends 15 knowledge-base questions to the backend, uses the local model as a judge, and uploads `faithfulness`, `answer_relevance`, `context_relevance`, and `expected_source_hit` scores to the related Langfuse traces.
