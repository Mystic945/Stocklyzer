from google.oauth2 import id_token as google_id_token
from google.auth.transport import requests as google_requests
from fastapi import HTTPException

from app.config import settings

_request = google_requests.Request()


def verify_google_token(token: str) -> dict:
    """Verify a Google ID token and return its payload (email, name, sub)."""
    if not settings.google_client_id:
        raise HTTPException(status_code=500, detail="Google OAuth is not configured on the server")
    try:
        payload = google_id_token.verify_oauth2_token(token, _request, settings.google_client_id)
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid Google token")

    if payload.get("aud") != settings.google_client_id:
        raise HTTPException(status_code=401, detail="Google token audience mismatch")

    return {
        "email": payload["email"],
        "full_name": payload.get("name", payload["email"].split("@")[0]),
        "sub": payload["sub"],
    }
