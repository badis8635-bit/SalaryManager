from fastapi import APIRouter, Depends, HTTPException  # type: ignore[import]
from sqlalchemy.orm import Session
from db.database import SessionLocal
from Services.AdminService import AdminService
from dependencies import get_db, get_current_admin
from auth import create_access_token, create_refresh_token, decode_token
from jose import JWTError  # type: ignore[import]
from pydantic import BaseModel, EmailStr  # type: ignore[import]

router = APIRouter(prefix="/admins", tags=["Admins"])

# --- Schemas Pydantic ---

class AdminCreate(BaseModel):
    email: EmailStr
    password: str

class AdminResponse(BaseModel):
    id: int
    email: str

    class Config:
        from_attributes = True

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class RefreshRequest(BaseModel):
    refresh_token: str

class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str

# --- Routes ---

@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    service = AdminService(db)
    try:
        admin = service.login(email=payload.email, password=payload.password)
        return TokenResponse(
            access_token=create_access_token(admin.id),
            refresh_token=create_refresh_token(admin.id)
        )
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))

@router.post("/refresh", response_model=TokenResponse)
def refresh_token(payload: RefreshRequest):
    try:
        data = decode_token(payload.refresh_token)
        if data.get("type") != "refresh":
            raise JWTError("Mauvais type de token")
        admin_id = int(data["sub"])
    except (JWTError, KeyError, ValueError):
        raise HTTPException(status_code=401, detail="Refresh token invalide ou expiré")
    return TokenResponse(
        access_token=create_access_token(admin_id),
        refresh_token=create_refresh_token(admin_id)
    )

@router.post("/", response_model=AdminResponse, status_code=201)
def create_admin(
    payload: AdminCreate,
    db: Session = Depends(get_db),
    _: int = Depends(get_current_admin)   # route protégée : seul un admin connecté peut créer un autre admin
):
    service = AdminService(db)
    try:
        return service.create_admin(email=payload.email, password=payload.password)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.patch("/{admin_id}/password", response_model=AdminResponse)
def change_password(
    admin_id: int,
    payload: ChangePasswordRequest,
    db: Session = Depends(get_db),
    current_admin_id: int = Depends(get_current_admin)
):
    if current_admin_id != admin_id:
        raise HTTPException(status_code=403, detail="Vous ne pouvez modifier que votre propre mot de passe")
    service = AdminService(db)
    try:
        return service.change_password(
            admin_id=admin_id,
            old_password=payload.old_password,
            new_password=payload.new_password
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{admin_id}", status_code=204)
def delete_admin(
    admin_id: int,
    db: Session = Depends(get_db),
    _: int = Depends(get_current_admin)
):
    service = AdminService(db)
    try:
        service.delete_admin(admin_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))