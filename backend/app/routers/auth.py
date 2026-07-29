from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas
from app.security import hash_password, verify_password, create_access_token
from app.services.google_oauth import verify_google_token

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=schemas.TokenResponse)
def register(payload: schemas.UserRegister, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter(models.User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email already exists")

    user = models.User(
        email=payload.email,
        full_name=payload.full_name,
        hashed_password=hash_password(payload.password),
        is_google_account=False,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(subject=user.id)
    return schemas.TokenResponse(access_token=token, user=schemas.UserOut.model_validate(user))


@router.post("/login", response_model=schemas.TokenResponse)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not user.hashed_password or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password")

    token = create_access_token(subject=user.id)
    return schemas.TokenResponse(access_token=token, user=schemas.UserOut.model_validate(user))


@router.post("/google", response_model=schemas.TokenResponse)
def google_login(payload: schemas.GoogleLoginRequest, db: Session = Depends(get_db)):
    google_data = verify_google_token(payload.id_token)

    user = db.query(models.User).filter(models.User.google_sub == google_data["sub"]).first()
    if not user:
        # Link to an existing email/password account, or create a new one
        user = db.query(models.User).filter(models.User.email == google_data["email"]).first()
        if user:
            user.google_sub = google_data["sub"]
            user.is_google_account = True
        else:
            user = models.User(
                email=google_data["email"],
                full_name=google_data["full_name"],
                google_sub=google_data["sub"],
                is_google_account=True,
            )
            db.add(user)
        db.commit()
        db.refresh(user)

    token = create_access_token(subject=user.id)
    return schemas.TokenResponse(access_token=token, user=schemas.UserOut.model_validate(user))
