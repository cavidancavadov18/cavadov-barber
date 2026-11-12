# CAVADOV BARBER — Python API

FastAPI + SQLAlchemy backend. Uses the same SQLite database as Prisma (`prisma/dev.db`).

## Local run

```bash
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
set DATABASE_URL=file:./dev.db
uvicorn app.main:app --reload --port 8000
```

Health check: `http://127.0.0.1:8000/api/health`

Next.js proxies `/api/*` to `BACKEND_URL` (default `http://127.0.0.1:8000`).
