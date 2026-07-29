from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas
from app.dependencies import get_current_user, get_owned_portfolio

router = APIRouter(prefix="/api/portfolios/{portfolio_id}/holdings", tags=["holdings"])


def _get_owned_holding(portfolio_id: str, holding_id: str, db: Session, user: models.User) -> models.Holding:
    get_owned_portfolio(portfolio_id, db, user)  # raises 404 if not owned
    holding = db.query(models.Holding).filter(
        models.Holding.id == holding_id,
        models.Holding.portfolio_id == portfolio_id,
    ).first()
    if not holding:
        raise HTTPException(status_code=404, detail="Holding not found")
    return holding


@router.get("", response_model=List[schemas.HoldingOut])
def list_holdings(portfolio_id: str, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    get_owned_portfolio(portfolio_id, db, user)
    return db.query(models.Holding).filter(models.Holding.portfolio_id == portfolio_id).all()


@router.post("", response_model=schemas.HoldingOut)
def add_holding(
    portfolio_id: str,
    payload: schemas.HoldingCreate,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    get_owned_portfolio(portfolio_id, db, user)
    ticker = payload.ticker.upper().strip()

    existing = db.query(models.Holding).filter(
        models.Holding.portfolio_id == portfolio_id,
        models.Holding.ticker == ticker,
    ).first()

    if existing:
        # Merge into existing holding using weighted average cost
        total_quantity = existing.quantity + payload.quantity
        existing.average_cost = (
            (existing.average_cost * existing.quantity) + (payload.average_cost * payload.quantity)
        ) / total_quantity
        existing.quantity = total_quantity
        holding = existing
    else:
        holding = models.Holding(
            portfolio_id=portfolio_id,
            ticker=ticker,
            quantity=payload.quantity,
            average_cost=payload.average_cost,
        )
        db.add(holding)

    db.flush()
    transaction = models.Transaction(
        holding_id=holding.id, type="buy", quantity=payload.quantity, price=payload.average_cost,
    )
    db.add(transaction)
    db.commit()
    db.refresh(holding)
    return holding


@router.delete("/{holding_id}", status_code=204)
def remove_holding(
    portfolio_id: str,
    holding_id: str,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    holding = _get_owned_holding(portfolio_id, holding_id, db, user)
    db.delete(holding)
    db.commit()
    return None


@router.post("/{holding_id}/transactions", response_model=schemas.HoldingOut)
def record_transaction(
    portfolio_id: str,
    holding_id: str,
    payload: schemas.TransactionCreate,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    holding = _get_owned_holding(portfolio_id, holding_id, db, user)

    if payload.type == "sell":
        if payload.quantity > holding.quantity:
            raise HTTPException(status_code=400, detail="Cannot sell more shares than currently held")
        holding.quantity -= payload.quantity
        # average_cost stays the same on a sell; only quantity shrinks
    else:  # buy
        total_quantity = holding.quantity + payload.quantity
        holding.average_cost = (
            (holding.average_cost * holding.quantity) + (payload.price * payload.quantity)
        ) / total_quantity
        holding.quantity = total_quantity

    transaction = models.Transaction(
        holding_id=holding.id, type=payload.type, quantity=payload.quantity, price=payload.price,
    )
    db.add(transaction)

    db.commit()

    if holding.quantity <= 0:
        # Capture final state before removing the now-empty holding
        result = schemas.HoldingOut.model_validate(holding)
        db.delete(holding)
        db.commit()
        return result

    db.refresh(holding)
    return holding
