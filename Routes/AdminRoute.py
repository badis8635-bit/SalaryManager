from fastapi import APIRouter, Depends, HTTPException  # type: ignore[import]
from sqlalchemy.orm import Session
from db.database import SessionLocal
from Services.AdminService import AdminService
from pydantic import BaseModel, EmailStr  # type: ignore[import]

router = APIRouter(prefix="/admins", tags=["Admins"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

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
    token_type: str = "bearer"

class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str

# --- Routes ---

@router.post("/", response_model=AdminResponse, status_code=201)
def create_admin(payload: AdminCreate, db: Session = Depends(get_db)):
    service = AdminService(db)
    try:
        return service.create_admin(email=payload.email, password=payload.password)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    service = AdminService(db)
    try:
        # service.login() retourne l'objet Admin — à l'étape JWT on génèrera le vrai token ici
        admin = service.login(email=payload.email, password=payload.password)
        return TokenResponse(access_token=f"__jwt_placeholder__{admin.id}__")
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))

@router.patch("/{admin_id}/password", response_model=AdminResponse)
def change_password(admin_id: int, payload: ChangePasswordRequest, db: Session = Depends(get_db)):
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
def delete_admin(admin_id: int, db: Session = Depends(get_db)):
    service = AdminService(db)
    try:
        service.delete_admin(admin_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))