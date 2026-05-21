from fastapi import Depends, HTTPException, status  # type: ignore[import]
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials  # type: ignore[import]
from sqlalchemy.orm import Session
from jose import JWTError  # type: ignore[import]
from db.database import SessionLocal
from auth import decode_token

bearer_scheme = HTTPBearer()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_admin(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db)
) -> int:
    """Dépendance injectée dans les routes protégées — retourne l'admin_id"""
    token = credentials.credentials
    try:
        payload = decode_token(token)
        if payload.get("type") != "access":
            raise JWTError("Mauvais type de token")
        admin_id = int(payload["sub"])
    except (JWTError, KeyError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token invalide ou expiré",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return admin_id