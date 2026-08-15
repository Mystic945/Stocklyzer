from datetime import datetime
from typing import Optional, List

from pydantic import BaseModel, EmailStr, Field


# ---------- Auth ----------

class UserRegister(BaseModel):
    email: EmailStr
    full_name: str
    password: str = Field(min_length=8, max_length=72)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class GoogleLoginRequest(BaseModel):
    id_token: str


class UserOut(BaseModel):
    id: str
    email: EmailStr
    full_name: str
    is_google_account: bool

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# ---------- Portfolio ----------

class PortfolioCreate(BaseModel):
    name: str
    description: Optional[str] = None
    base_currency: str = "USD"


class PortfolioOut(BaseModel):
    id: str
    name: str
    description: Optional[str]
    base_currency: str
    created_at: datetime

    class Config:
        from_attributes = True


# ---------- Holding ----------

class HoldingCreate(BaseModel):
    ticker: str
    quantity: float = Field(gt=0)
    average_cost: float = Field(gt=0)


class HoldingOut(BaseModel):
    id: str
    ticker: str
    quantity: float
    average_cost: float
    created_at: datetime

    class Config:
        from_attributes = True


class HoldingWithMarketData(HoldingOut):
    current_price: float
    market_value: float
    cost_basis: float
    gain_loss: float
    gain_loss_pct: float
    day_change_pct: Optional[float] = None


# ---------- Transaction ----------

class TransactionCreate(BaseModel):
    type: str = Field(pattern="^(buy|sell)$")
    quantity: float = Field(gt=0)
    price: float = Field(gt=0)


class TransactionOut(BaseModel):
    id: str
    type: str
    quantity: float
    price: float
    executed_at: datetime

    class Config:
        from_attributes = True


# ---------- Analytics ----------

class PortfolioSummary(BaseModel):
    total_market_value: float
    total_cost_basis: float
    total_gain_loss: float
    total_gain_loss_pct: float
    holdings: List[HoldingWithMarketData]


class RiskMetrics(BaseModel):
    portfolio_volatility_annualized: float
    sharpe_ratio: Optional[float]
    beta_vs_market: Optional[float]
    diversification_score: float  # 0-100, higher = more diversified
    concentration_risk: List[dict]  # top holdings by % of portfolio
    sector_allocation: List[dict]


class CorrelationMatrix(BaseModel):
    tickers: List[str]
    matrix: List[List[float]]


# ---------- AI Insights ----------

class AIInsightRequest(BaseModel):
    focus: Optional[str] = None  # e.g. "risk", "diversification", "general"


class AIInsightResponse(BaseModel):
    summary: str
    generated_at: datetime
