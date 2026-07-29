from datetime import datetime

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas
from app.dependencies import get_current_user, get_owned_portfolio
from app.services import analytics_engine, ai_insights

router = APIRouter(prefix="/api/portfolios/{portfolio_id}/insights", tags=["insights"])


@router.post("", response_model=schemas.AIInsightResponse)
def generate_insight(
    portfolio_id: str,
    payload: schemas.AIInsightRequest,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    get_owned_portfolio(portfolio_id, db, user)
    holdings = db.query(models.Holding).filter(models.Holding.portfolio_id == portfolio_id).all()

    summary = analytics_engine.build_portfolio_summary(holdings)
    risk = analytics_engine.build_risk_metrics(holdings)

    text = ai_insights.generate_portfolio_insight(summary, risk, focus=payload.focus)
    return schemas.AIInsightResponse(summary=text, generated_at=datetime.utcnow())
