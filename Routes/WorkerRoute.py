from fastapi import APIRouter, Depends, HTTPException  # type: ignore[import]
from sqlalchemy.orm import Session
from db.database import SessionLocal
from Services.WorkerService import WorkerService
from Models.Worker import WorkerType
from pydantic import BaseModel, EmailStr  # type: ignore[import]
from decimal import Decimal

router = APIRouter(prefix="/workers", tags=["Workers"])

# Dependency injection de la session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- Schemas Pydantic ---

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

# --- Routes ---

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