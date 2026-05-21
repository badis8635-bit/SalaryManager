from fastapi import APIRouter, Depends, HTTPException  # type: ignore[import]
from sqlalchemy.orm import Session
from db.database import SessionLocal
from Services.PayslipService import PayslipService
from Models.Payslip import PayslipStatus
from pydantic import BaseModel  # type: ignore[import]
from decimal import Decimal
from datetime import date
from typing import Optional

router = APIRouter(prefix="/payslips", tags=["Payslips"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- Schemas Pydantic ---

class PayslipGenerateRequest(BaseModel):
    worker_id: int
    month: int
    year: int
    bonus: Decimal = Decimal("0.00")

class PayslipGeneratePeriodRequest(BaseModel):
    month: int
    year: int

class PayslipResponse(BaseModel):
    id: int
    worker_id: int
    contract_id: int
    period_month: int
    period_year: int
    gross_salary: Decimal
    bonus: Decimal
    onss_employee: Decimal
    onss_employer: Decimal
    precompte: Decimal
    net_salary: Decimal
    status: PayslipStatus
    paid_at: Optional[date]
    period_status: str

    class Config:
        from_attributes = True

class PeriodSummaryResponse(BaseModel):
    period: str
    total_workers: int
    total_gross: Decimal
    total_bonus: Decimal
    total_net: Decimal
    total_onss_employer: Decimal
    total_cost: Decimal
    paid_count: int
    pending_count: int

# --- Routes ---

@router.post("/generate", response_model=PayslipResponse, status_code=201)
def generate_payslip(payload: PayslipGenerateRequest, db: Session = Depends(get_db)):
    service = PayslipService(db)
    try:
        return service.generate_payslip(
            worker_id=payload.worker_id,
            month=payload.month,
            year=payload.year,
            bonus=payload.bonus
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/generate-period", response_model=list[PayslipResponse], status_code=201)
def generate_payslips_for_period(payload: PayslipGeneratePeriodRequest, db: Session = Depends(get_db)):
    service = PayslipService(db)
    return service.generate_payslips_for_period(month=payload.month, year=payload.year)

@router.get("/pending", response_model=list[PayslipResponse])
def get_pending_payslips(db: Session = Depends(get_db)):
    service = PayslipService(db)
    return service.get_pending_payslips()

@router.get("/period/{year}/{month}/summary", response_model=PeriodSummaryResponse)
def get_period_summary(year: int, month: int, db: Session = Depends(get_db)):
    service = PayslipService(db)
    return service.get_period_summary(month=month, year=year)

@router.get("/worker/{worker_id}", response_model=list[PayslipResponse])
def get_history_by_worker(worker_id: int, db: Session = Depends(get_db)):
    service = PayslipService(db)
    try:
        return service.get_history_by_worker(worker_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.patch("/{payslip_id}/pay", response_model=PayslipResponse)
def mark_as_paid(payslip_id: int, db: Session = Depends(get_db)):
    service = PayslipService(db)
    try:
        return service.mark_as_paid(payslip_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.patch("/{payslip_id}/cancel", response_model=PayslipResponse)
def cancel_payslip(payslip_id: int, db: Session = Depends(get_db)):
    service = PayslipService(db)
    try:
        return service.cancel_payslip(payslip_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))