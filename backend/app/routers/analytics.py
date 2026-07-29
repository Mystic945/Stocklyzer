from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas
from app.dependencies import get_current_user, get_owned_portfolio
from app.services import analytics_engine

router = APIRouter(prefix="/api/portfolios/{portfolio_id}/analytics", tags=["analytics"])


def _holdings_for(portfolio_id: str, db: Session, user: models.User):
    get_owned_portfolio(portfolio_id, db, user)
    return db.query(models.Holding).filter(models.Holding.portfolio_id == portfolio_id).all()


@router.get("/summary", response_model=schemas.PortfolioSummary)
def portfolio_summary(portfolio_id: str, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    holdings = _holdings_for(portfolio_id, db, user)
    return analytics_engine.build_portfolio_summary(holdings)


@router.get("/risk", response_model=schemas.RiskMetrics)
def risk_metrics(portfolio_id: str, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    holdings = _holdings_for(portfolio_id, db, user)
    return analytics_engine.build_risk_metrics(holdings)


@router.get("/correlation", response_model=schemas.CorrelationMatrix)
def correlation_matrix(portfolio_id: str, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    holdings = _holdings_for(portfolio_id, db, user)
    return analytics_engine.build_correlation_matrix(holdings)
