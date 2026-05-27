from datetime import datetime, timedelta, timezone
from jose import JWTError, jwt  # type: ignore[import]

SECRET_KEY  = "change-this-secret-in-production"
ALGORITHM   = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES  = 30
REFRESH_TOKEN_EXPIRE_DAYS    = 7

def create_access_token(admin_id: int) -> str:
    payload = {
        "sub":  str(admin_id),
        "type": "access",
        "role": "admin",
        "exp":  datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def create_refresh_token(admin_id: int) -> str:
    payload = {
        "sub":  str(admin_id),
        "type": "refresh",
        "role": "admin",
        "exp":  datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def create_employee_token(worker_id: int) -> str:
    """Token JWT pour un employé — role: employee, expire dans 8h"""
    payload = {
        "sub":  str(worker_id),
        "type": "access",
        "role": "employee",
        "exp":  datetime.now(timezone.utc) + timedelta(hours=8)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def decode_token(token: str) -> dict:
    return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])