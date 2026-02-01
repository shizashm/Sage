# Mentra (Sage)

AI-assisted intake, coordination, and handoff for group therapy matching. Clients complete an intake chat, get matched to a support group, schedule sessions, and pay; therapists receive handoff summaries.

## Tech Stack

| Layer     | Stack |
| --------- | ----- |
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Router |
| **Backend**  | FastAPI, SQLAlchemy (async), Pydantic |
| **Database** | PostgreSQL (e.g. Supabase) |
| **LLM**      | Groq or OpenAI (chat, extraction, matching) |

## Prerequisites

- **Node.js** 18+ and npm/bun
- **Python** 3.11+
- **PostgreSQL** (local or Supabase)

## Quick Start

### 1. Clone and install

```bash
git clone <your-repo-url>
cd Mentra
```

### 2. Backend

```bash
cd backend
python -m venv .venv
# Windows:   .venv\Scripts\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
```

Create `backend/.env` (see [Environment](#environment)) and run:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

- API: http://localhost:8000
- Docs: http://localhost:8000/docs

### 3. Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env` if needed (see [Environment](#environment)), then:

```bash
npm run dev
```

- App: http://localhost:5173

## Environment

### Backend (`backend/.env`)

| Variable         | Description |
| ---------------- | ----------- |
| `DATABASE_URL`   | PostgreSQL connection string (e.g. Supabase). Use `postgresql+asyncpg://...` for async. |
| `GROQ_API_KEY`   | Optional. Groq API key for chat/extraction (free tier). If set, OpenAI is not used. |
| `OPENAI_API_KEY` | Optional. OpenAI API key for chat/extraction when Groq is not set. |
| `SECRET_KEY`     | Optional. Used for signing; change in production. |

Example (Supabase):

```env
DATABASE_URL=postgresql+asyncpg://postgres:[PASSWORD]@[HOST]:5432/postgres
GROQ_API_KEY=your_groq_key
```

If neither `GROQ_API_KEY` nor `OPENAI_API_KEY` is set, chat uses mock replies.

### Frontend (`frontend/.env`)

| Variable        | Description |
| --------------- | ----------- |
| `VITE_API_BASE` | Optional. Backend base URL. Default: `http://localhost:8000`. |

## Project Structure

```
Mentra/
├── backend/                 # FastAPI (Sage API)
│   ├── app/
│   │   ├── api/             # auth, chat, intake, groups, scheduling, payments, handoff
│   │   ├── core/            # auth (session), logging
│   │   ├── models/          # SQLAlchemy models (user, chat, intake, group, scheduling, payment)
│   │   ├── schemas/         # Pydantic request/response
│   │   └── services/        # crisis, llm, extraction, matching
│   ├── scripts/             # set_user_password, test_chat_llm
│   └── requirements.txt
├── frontend/                # React + Vite
│   ├── src/
│   │   ├── components/      # layouts, chat, growth, therapist, ui (shadcn)
│   │   ├── contexts/        # AuthContext
│   │   ├── lib/             # api client
│   │   └── pages/           # Login, Dashboard, Chat, Schedule, Payment, TherapistDashboard, etc.
│   └── package.json
└── README.md
```

## API Overview

| Area        | Endpoints | Description |
| ----------- | ---------- | ------------ |
| **Auth**    | `POST /api/auth/signup`, `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/logout` | Session-based auth; send `X-Session-Id` on authenticated requests. |
| **Chat**    | `POST /api/chat/send`, `GET /api/chat/history`, `POST /api/chat/complete`, `POST /api/chat/restart` | Intake chat, LLM reply, extraction, auto-matching when intake is complete. |
| **Intake**  | `GET /api/intake` | Structured intake for the current user. |
| **Groups**  | `GET /api/groups/my`, `GET /api/groups`, `GET /api/groups/{id}` | My group, list groups, group by id. |
| **Scheduling** | `GET /api/scheduling/slots`, `POST /api/scheduling/confirm` | Slots for user's group, confirm slot. |
| **Payments** | `POST /api/payments/create`, `GET /api/payments/{id}/status`, `POST /api/payments/{id}/confirm` | Create and confirm payment (mock). |
| **Handoff** | `GET /api/handoff/groups`, `GET /api/handoff/group/{id}`, `GET /api/handoff/group/{id}/document` | Therapist: groups and participant summaries. |

## User Roles

- **Client** (`role=client`): Signup → intake chat → matched to group → schedule → pay → view dashboard, my group, upcoming.
- **Therapist** (`role=therapist`): Login → therapist dashboard → handoff groups and participant summaries.

Therapists are the same `User` model with `role="therapist"`. Add via signup with `"role": "therapist"` or by inserting/updating a user in the DB with `role = 'therapist'`.

## Scripts

- **Set user password (backend):**  
  `python scripts/set_user_password.py user@example.com "new_password"`  
  Run from `backend/`; user must already exist.

## License

Open source (MIT / Apache 2.0 or as per hackathon rules).
