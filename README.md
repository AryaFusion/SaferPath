# SaferPath

SaferPath contains one canonical React application and a FastAPI backend:

- `frontend/` is the canonical React/Vite frontend.
- `backend/` contains the FastAPI, SQLAlchemy, PostgreSQL/PostGIS application.
- `doc/` and `docs/` contain project documentation.

## Frontend

```powershell
cd frontend
npm install
npm run dev
```

Build and lint the frontend from `frontend/` with `npm run build` and `npm run lint`.

## Backend

See `backend/README.md` for backend setup, Docker, database, and test commands.
