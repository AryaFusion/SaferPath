# SaferPath Backend

The backend targets Python 3.14 and provides the BE-00 platform foundation only. Domain features such as routing, safety context, reports, help points, trips, and trusted contacts are intentionally not included.

## PowerShell setup

From the repository root:

```powershell
.\backend\.venv\Scripts\Activate.ps1
python -m pip install -e ".\backend[dev]"
Copy-Item .\backend\.env.example .\backend\.env
docker compose -f backend\docker-compose.yml up -d
```

The development database is PostgreSQL + PostGIS in `saferpath-postgres`, exposed on host port `5435` and container port `5432`. Port 5433 is used by another project on this machine, and 5434 is also occupied.

Verify the database:

```powershell
docker compose -f backend\docker-compose.yml ps
docker exec saferpath-postgres psql -U saferpath -d saferpath -c "SELECT version();"
docker exec saferpath-postgres psql -U saferpath -d saferpath -c "SELECT PostGIS_Version();"
```

## Migrations and API

```powershell
Set-Location backend
alembic current
alembic heads
alembic upgrade head
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Available system endpoints are `GET /`, `GET /v1/health`, `GET /v1/readiness`, and the OpenAPI UI at `/docs`.

## Tests and lint

```powershell
Set-Location backend
pytest -q
ruff check .
```

The local `.env` is ignored by Git. Use environment variables or a deployment secret manager for non-development credentials.
