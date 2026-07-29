import json
from fastapi import HTTPException

import anthropic

from app.config import settings

SYSTEM_PROMPT = """You are a portfolio analytics assistant embedded in Stocklyzer, a personal \
investment tracking app. You are given pre-computed, factual metrics about a user's stock \
portfolio (holdings, valuations, risk metrics, sector allocation, correlations). Your job is to \
write a short, plain-language summary that helps the user understand their portfolio's current \
shape, notable risks, and concentration issues.

Rules:
- Base every statement strictly on the numbers provided. Never invent tickers, prices, or events.
- Do not give buy/sell/hold recommendations or predict future prices — this is informational \
analysis, not investment advice.
- Keep it to 3-5 short paragraphs or a short paragraph plus a few bullet points.
- Mention concrete numbers from the data (percentages, ratios) to ground your observations.
- Note plainly if the data is too sparse (e.g. only one holding) to say much.
- End with a one-line reminder that this is not financial advice.
"""


def generate_portfolio_insight(summary: dict, risk: dict, focus: str | None = None) -> str:
    if not settings.anthropic_api_key:
        raise HTTPException(
            status_code=500,
            detail="AI insights are not configured — set ANTHROPIC_API_KEY on the server.",
        )

    client = anthropic.Anthropic(api_key=settings.anthropic_api_key)

    focus_instruction = f"\nThe user specifically wants the summary to focus on: {focus}." if focus else ""

    user_content = (
        "Here is the computed portfolio data (JSON). Write the summary described in your "
        f"instructions.{focus_instruction}\n\n"
        f"Portfolio summary:\n{json.dumps(summary, default=str, indent=2)}\n\n"
        f"Risk metrics:\n{json.dumps(risk, default=str, indent=2)}"
    )

    try:
        response = client.messages.create(
            model=settings.anthropic_model,
            max_tokens=700,
            system=SYSTEM_PROMPT,
            messages=[{"role": "user", "content": user_content}],
        )
    except anthropic.APIError as e:
        raise HTTPException(status_code=502, detail=f"AI insight generation failed: {e}")

    text_blocks = [block.text for block in response.content if block.type == "text"]
    return "\n".join(text_blocks).strip()
