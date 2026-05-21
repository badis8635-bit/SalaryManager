from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import JWTError, jwt  # type: ignore[import]

# --- Configuration ---
SECRET_KEY = "change-this-secret-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 7

# --- Création des tokens ---

def create_access_token(admin_id: int) -> str:
    payload = {
        "sub": str(admin_id),
        "type": "access",
        "exp": datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def create_refresh_token(admin_id: int) -> str:
    payload = {
        "sub": str(admin_id),
        "type": "refresh",
        "exp": datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def decode_token(token: str) -> dict:
    """Décode et valide un token — lève JWTError si invalide ou expiré"""
    return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])