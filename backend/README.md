# Sage Backend

FastAPI backend for AI-orchestrated group therapy matching & coordination. Session-based auth (no JWT), PostgreSQL, async throughout, with structured logging.

## Features

- **Auth:** Signup, login, `GET /api/auth/me` — uses `X-Session-Id` header (session ID returned on login/signup).
- **Chat:** `POST /api/chat/send`, `GET /api/chat/history`, `POST /api/chat/complete` — crisis keyword detection, LLM or mock reply, output guard.
- **Intake:** `GET /api/intake` — structured intake (primary_concern, emotional_intensity, etc.; no group_readiness).
- **Groups:** `GET /api/groups/my`, `GET /api/groups`, `GET /api/groups/{id}` — explainable matching.
- **Scheduling:** `GET /api/scheduling/slots`, `POST /api/scheduling/confirm`.
- **Payments:** `POST /api/payments`, `GET /api/payments/{id}/status`, `POST /api/payments/{id}/confirm` (mock).
- **Handoff:** `GET /api/handoff/groups`, `GET /api/handoff/group/{id}`, `GET /api/handoff/group/{id}/document`.

## Setup

### 1. Python & PostgreSQL

- Python 3.11+
- PostgreSQL running (create DB: `createdb sage` or use existing URL).

### 2. Virtual env and install

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate   # Windows
# source .venv/bin/activate  # Linux/macOS
pip install -r requirements.txt
```

### 3. Environment

```bash
cp .env.example .env
# Edit .env: set DATABASE_URL, optionally OPENAI_API_KEY
```

### 4. Run

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

- API: http://localhost:8000  
- Docs: http://localhost:8000/docs  
- Health: http://localhost:8000/health  

## Auth (no JWT)

- **Signup:** `POST /api/auth/signup` body `{ "email": "...", "password": "..." }` → `{ "user_id", "session_id" }`.
- **Login:** `POST /api/auth/login` same body → same response.
- **Authenticated requests:** Send header `X-Session-Id: <session_id>` on all other APIs.

## Logging

- Structured logs to stdout: `timestamp | level | logger | message | request_id=... session_id=...`.
- Middleware logs each request start/complete with method, path, status, duration.
- Auth, chat, intake, groups, scheduling, payments, handoff log key actions with context.

## License

Open source (MIT / Apache 2.0 / GPL as per hackathon).
