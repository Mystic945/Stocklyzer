import time
from typing import Dict, List, Optional

import pandas as pd
import yfinance as yf

# Simple in-memory TTL cache so repeated dashboard loads don't hammer yfinance.
_quote_cache: Dict[str, dict] = {}
_history_cache: Dict[str, tuple] = {}
QUOTE_TTL_SECONDS = 60
HISTORY_TTL_SECONDS = 60 * 30


def get_quote(ticker: str) -> dict:
    """Return current price + previous close + sector for a single ticker."""
    now = time.time()
    cached = _quote_cache.get(ticker)
    if cached and now - cached["_ts"] < QUOTE_TTL_SECONDS:
        return cached

    t = yf.Ticker(ticker)
    info = t.fast_info
    try:
        current_price = float(info["last_price"])
        previous_close = float(info["previous_close"])
    except Exception:
        # fall back to slower .info if fast_info is incomplete
        slow = t.info
        current_price = float(slow.get("currentPrice") or slow.get("regularMarketPrice") or 0)
        previous_close = float(slow.get("previousClose") or current_price)

    sector = None
    try:
        sector = t.info.get("sector")
    except Exception:
        pass

    day_change_pct = ((current_price - previous_close) / previous_close * 100) if previous_close else 0.0

    result = {
        "ticker": ticker,
        "current_price": current_price,
        "previous_close": previous_close,
        "day_change_pct": day_change_pct,
        "sector": sector or "Unknown",
        "_ts": now,
    }
    _quote_cache[ticker] = result
    return result


def get_quotes(tickers: List[str]) -> Dict[str, dict]:
    return {t: get_quote(t) for t in tickers}


def get_price_history(ticker: str, period: str = "1y") -> Optional[pd.Series]:
    """Return a series of daily adjusted close prices for correlation/volatility calcs."""
    now = time.time()
    cache_key = f"{ticker}:{period}"
    cached = _history_cache.get(cache_key)
    if cached and now - cached[0] < HISTORY_TTL_SECONDS:
        return cached[1]

    hist = yf.Ticker(ticker).history(period=period, auto_adjust=True)
    if hist.empty:
        return None
    series = hist["Close"]
    _history_cache[cache_key] = (now, series)
    return series


def get_returns_frame(tickers: List[str], period: str = "1y") -> pd.DataFrame:
    """Build a DataFrame of daily returns for a list of tickers, aligned by date."""
    price_data = {}
    for ticker in tickers:
        series = get_price_history(ticker, period=period)
        if series is not None:
            price_data[ticker] = series

    if not price_data:
        return pd.DataFrame()

    prices = pd.DataFrame(price_data).dropna(how="all")
    returns = prices.pct_change().dropna(how="all")
    return returns
