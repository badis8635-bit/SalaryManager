from fastapi import APIRouter, Depends, HTTPException  # type: ignore[import]
from sqlalchemy.orm import Session
from db.database import SessionLocal
from Services.WorkerService import WorkerService
from Models.Worker import WorkerType
from pydantic import BaseModel, EmailStr  # type: ignore[import]
from auth import create_employee_token

router = APIRouter(prefix="/workers", tags=["Workers"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- Schemas ---

class WorkerCreate(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str
    worker_type: WorkerType

class WorkerResponse(BaseModel):
    id: int
    email: str
    first_name: str
    last_name: str
    worker_type: WorkerType
    is_active: bool
    class Config:
        from_attributes = True

class SetPasswordRequest(BaseModel):
    password: str

class WorkerLoginRequest(BaseModel):
    email: EmailStr
    password: str

class WorkerTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    worker_id: int
    first_name: str
    last_name: str

# --- Routes existantes ---

@router.get("/", response_model=list[WorkerResponse])
def get_all_workers(db: Session = Depends(get_db)):
    service = WorkerService(db)
    return service.get_all()

@router.get("/active", response_model=list[WorkerResponse])
def get_active_workers(db: Session = Depends(get_db)):
    service = WorkerService(db)
    return service.get_all_active()

@router.get("/{worker_id}", response_model=WorkerResponse)
def get_worker(worker_id: int, db: Session = Depends(get_db)):
    service = WorkerService(db)
    try:
        result = service.get_worker_with_contract(worker_id)
        return result["worker"]
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.post("/", response_model=WorkerResponse, status_code=201)
def create_worker(payload: WorkerCreate, db: Session = Depends(get_db)):
    service = WorkerService(db)
    try:
        return service.create_worker(
            email=payload.email,
            first_name=payload.first_name,
            last_name=payload.last_name,
            worker_type=payload.worker_type
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.patch("/{worker_id}/deactivate", response_model=WorkerResponse)
def deactivate_worker(worker_id: int, db: Session = Depends(get_db)):
    service = WorkerService(db)
    try:
        return service.deactivate_worker(worker_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.patch("/{worker_id}/activate", response_model=WorkerResponse)
def activate_worker(worker_id: int, db: Session = Depends(get_db)):
    service = WorkerService(db)
    try:
        return service.activate_worker(worker_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{worker_id}", status_code=204)
def delete_worker(worker_id: int, db: Session = Depends(get_db)):
    service = WorkerService(db)
    try:
        service.delete_worker(worker_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

# --- Nouvelles routes (rôles) ---

@router.post("/login", response_model=WorkerTokenResponse)
def worker_login(payload: WorkerLoginRequest, db: Session = Depends(get_db)):
    """Login employé — retourne un JWT avec role: employee"""
    service = WorkerService(db)
    try:
        worker = service.login(email=payload.email, password=payload.password)
        return WorkerTokenResponse(
            access_token=create_employee_token(worker.id),
            worker_id=worker.id,
            first_name=worker.first_name,
            last_name=worker.last_name
        )
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))

@router.patch("/{worker_id}/set-password", response_model=WorkerResponse)
def set_worker_password(worker_id: int, payload: SetPasswordRequest, db: Session = Depends(get_db)):
    """Permet à l'admin de définir le mot de passe d'un employé"""
    service = WorkerService(db)
    try:
        return service.set_password(worker_id, payload.password)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))