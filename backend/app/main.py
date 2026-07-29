from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.config import settings
from app.routers import auth, portfolios, holdings, analytics, insights

# Create tables if they don't exist yet. For production schema changes, use Alembic migrations
# instead of relying on this (see README).
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Stocklyzer API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin, "http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(portfolios.router)
app.include_router(holdings.router)
app.include_router(analytics.router)
app.include_router(insights.router)


@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "stocklyzer-api"}
