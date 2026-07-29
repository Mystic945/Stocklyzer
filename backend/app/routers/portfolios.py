from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas
from app.dependencies import get_current_user, get_owned_portfolio

router = APIRouter(prefix="/api/portfolios", tags=["portfolios"])


@router.get("", response_model=List[schemas.PortfolioOut])
def list_portfolios(db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    return db.query(models.Portfolio).filter(models.Portfolio.user_id == user.id).all()


@router.post("", response_model=schemas.PortfolioOut)
def create_portfolio(
    payload: schemas.PortfolioCreate,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    portfolio = models.Portfolio(user_id=user.id, **payload.model_dump())
    db.add(portfolio)
    db.commit()
    db.refresh(portfolio)
    return portfolio


@router.get("/{portfolio_id}", response_model=schemas.PortfolioOut)
def get_portfolio(portfolio_id: str, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    return get_owned_portfolio(portfolio_id, db, user)


@router.delete("/{portfolio_id}", status_code=204)
def delete_portfolio(portfolio_id: str, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    portfolio = get_owned_portfolio(portfolio_id, db, user)
    db.delete(portfolio)
    db.commit()
    return None
