from typing import List
import numpy as np
import pandas as pd

from app import models
from app.services import market_data

# ~13-week US Treasury yield used as a rough risk-free rate for Sharpe ratio.
RISK_FREE_RATE_ANNUAL = 0.045
TRADING_DAYS = 252
MARKET_BENCHMARK = "^GSPC"  # S&P 500, used for beta calculation


def build_portfolio_summary(holdings: List[models.Holding]) -> dict:
    if not holdings:
        return {
            "total_market_value": 0.0,
            "total_cost_basis": 0.0,
            "total_gain_loss": 0.0,
            "total_gain_loss_pct": 0.0,
            "holdings": [],
        }

    quotes = market_data.get_quotes([h.ticker for h in holdings])

    enriched = []
    total_value = 0.0
    total_cost = 0.0

    for h in holdings:
        quote = quotes.get(h.ticker, {})
        current_price = quote.get("current_price", 0.0)
        market_value = current_price * h.quantity
        cost_basis = h.average_cost * h.quantity
        gain_loss = market_value - cost_basis
        gain_loss_pct = (gain_loss / cost_basis * 100) if cost_basis else 0.0

        total_value += market_value
        total_cost += cost_basis

        enriched.append({
            "id": h.id,
            "ticker": h.ticker,
            "quantity": h.quantity,
            "average_cost": h.average_cost,
            "created_at": h.created_at,
            "current_price": current_price,
            "market_value": market_value,
            "cost_basis": cost_basis,
            "gain_loss": gain_loss,
            "gain_loss_pct": gain_loss_pct,
            "day_change_pct": quote.get("day_change_pct"),
        })

    total_gain_loss = total_value - total_cost
    total_gain_loss_pct = (total_gain_loss / total_cost * 100) if total_cost else 0.0

    return {
        "total_market_value": total_value,
        "total_cost_basis": total_cost,
        "total_gain_loss": total_gain_loss,
        "total_gain_loss_pct": total_gain_loss_pct,
        "holdings": enriched,
    }


def _portfolio_weights(holdings: List[models.Holding], quotes: dict) -> pd.Series:
    values = {h.ticker: quotes.get(h.ticker, {}).get("current_price", 0.0) * h.quantity for h in holdings}
    total = sum(values.values())
    if total == 0:
        return pd.Series(dtype=float)
    return pd.Series({t: v / total for t, v in values.items()})


def build_risk_metrics(holdings: List[models.Holding]) -> dict:
    if not holdings:
        return {
            "portfolio_volatility_annualized": 0.0,
            "sharpe_ratio": None,
            "beta_vs_market": None,
            "diversification_score": 0.0,
            "concentration_risk": [],
            "sector_allocation": [],
        }

    tickers = [h.ticker for h in holdings]
    quotes = market_data.get_quotes(tickers)
    weights = _portfolio_weights(holdings, quotes)

    returns = market_data.get_returns_frame(tickers)
    portfolio_vol = 0.0
    sharpe = None
    beta = None

    if not returns.empty and not weights.empty:
        aligned_weights = weights.reindex(returns.columns).fillna(0)
        portfolio_daily_returns = returns.fillna(0).dot(aligned_weights)
        portfolio_vol = float(portfolio_daily_returns.std() * np.sqrt(TRADING_DAYS))

        mean_daily_return = portfolio_daily_returns.mean() * TRADING_DAYS
        if portfolio_vol > 0:
            sharpe = float((mean_daily_return - RISK_FREE_RATE_ANNUAL) / portfolio_vol)

        # Beta vs S&P 500
        benchmark_series = market_data.get_price_history(MARKET_BENCHMARK)
        if benchmark_series is not None:
            benchmark_returns = benchmark_series.pct_change().dropna()
            aligned = pd.concat([portfolio_daily_returns, benchmark_returns], axis=1, join="inner").dropna()
            aligned.columns = ["portfolio", "benchmark"]
            if len(aligned) > 5 and aligned["benchmark"].var() > 0:
                cov = aligned["portfolio"].cov(aligned["benchmark"])
                beta = float(cov / aligned["benchmark"].var())

    # Diversification score: combination of holding count and inverse Herfindahl index (concentration)
    n = len(holdings)
    if not weights.empty:
        herfindahl = float((weights ** 2).sum())  # 1/n if equal weight, up to 1 if fully concentrated
    else:
        herfindahl = 1.0
    sector_counts = pd.Series([quotes.get(t, {}).get("sector", "Unknown") for t in tickers]).nunique()

    # Score 0-100: rewards more holdings, more sectors, and lower concentration
    concentration_component = (1 - herfindahl) * 60
    breadth_component = min(n, 10) / 10 * 20
    sector_component = min(sector_counts, 8) / 8 * 20
    diversification_score = round(concentration_component + breadth_component + sector_component, 1)

    concentration_risk = sorted(
        [{"ticker": t, "weight_pct": round(w * 100, 2)} for t, w in weights.items()],
        key=lambda x: -x["weight_pct"],
    )[:5]

    sector_map = {}
    for h in holdings:
        sector = quotes.get(h.ticker, {}).get("sector", "Unknown")
        sector_map[sector] = sector_map.get(sector, 0) + weights.get(h.ticker, 0)
    sector_allocation = sorted(
        [{"sector": s, "weight_pct": round(w * 100, 2)} for s, w in sector_map.items()],
        key=lambda x: -x["weight_pct"],
    )

    return {
        "portfolio_volatility_annualized": round(portfolio_vol * 100, 2),
        "sharpe_ratio": round(sharpe, 2) if sharpe is not None else None,
        "beta_vs_market": round(beta, 2) if beta is not None else None,
        "diversification_score": diversification_score,
        "concentration_risk": concentration_risk,
        "sector_allocation": sector_allocation,
    }


def build_correlation_matrix(holdings: List[models.Holding]) -> dict:
    tickers = [h.ticker for h in holdings]
    if len(tickers) < 2:
        return {"tickers": tickers, "matrix": [[1.0] for _ in tickers] if tickers else []}

    returns = market_data.get_returns_frame(tickers)
    if returns.empty:
        return {"tickers": tickers, "matrix": []}

    corr = returns.corr().fillna(0)
    ordered_tickers = [t for t in tickers if t in corr.columns]
    matrix = corr.loc[ordered_tickers, ordered_tickers].round(3).values.tolist()

    return {"tickers": ordered_tickers, "matrix": matrix}
