from fastapi import APIRouter, Depends, HTTPException  # type: ignore[import]
from sqlalchemy.orm import Session
from db.database import SessionLocal
from Services.ContractService import ContractService
from Models.Contract import ContractType
from pydantic import BaseModel  # type: ignore[import]
from decimal import Decimal
from datetime import date
from typing import Optional

router = APIRouter(prefix="/contracts", tags=["Contracts"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- Schemas Pydantic ---

class ContractCreate(BaseModel):
    worker_id: int
    contract_type: ContractType
    gross_salary: Decimal
    start_date: date
    end_date: Optional[date] = None
    onss_employee_rate: Decimal = Decimal("13.07")
    onss_employer_rate: Decimal = Decimal("27.00")
    precompte_rate: Decimal = Decimal("26.75")

class ContractResponse(BaseModel):
    id: int
    worker_id: int
    contract_type: ContractType
    gross_salary: Decimal
    start_date: date
    end_date: Optional[date]
    onss_employee_rate: Decimal
    onss_employer_rate: Decimal
    precompte_rate: Decimal

    class Config:
        from_attributes = True

class UpdateSalaryRequest(BaseModel):
    new_gross_salary: Decimal

class UpdateTaxRatesRequest(BaseModel):
    onss_employee_rate: Optional[Decimal] = None
    onss_employer_rate: Optional[Decimal] = None
    precompte_rate: Optional[Decimal] = None

class ContractCostResponse(BaseModel):
    gross_salary: Decimal
    onss_employer: Decimal
    total_employer_cost: Decimal

class TerminateContractRequest(BaseModel):
    end_date: date

# --- Routes ---

@router.post("/", response_model=ContractResponse, status_code=201)
def create_contract(payload: ContractCreate, db: Session = Depends(get_db)):
    service = ContractService(db)
    try:
        return service.create_contract(
            worker_id=payload.worker_id,
            contract_type=payload.contract_type,
            gross_salary=payload.gross_salary,
            start_date=payload.start_date,
            end_date=payload.end_date,
            onss_employee_rate=payload.onss_employee_rate,
            onss_employer_rate=payload.onss_employer_rate,
            precompte_rate=payload.precompte_rate
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/worker/{worker_id}", response_model=ContractResponse)
def get_contract_by_worker(worker_id: int, db: Session = Depends(get_db)):
    service = ContractService(db)
    try:
        return service.get_by_worker_id(worker_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/worker/{worker_id}/cost", response_model=ContractCostResponse)
def get_contract_cost(worker_id: int, db: Session = Depends(get_db)):
    service = ContractService(db)
    try:
        return service.get_contract_cost(worker_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.patch("/worker/{worker_id}/salary", response_model=ContractResponse)
def update_salary(worker_id: int, payload: UpdateSalaryRequest, db: Session = Depends(get_db)):
    service = ContractService(db)
    try:
        return service.update_salary(worker_id, payload.new_gross_salary)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.patch("/worker/{worker_id}/tax-rates", response_model=ContractResponse)
def update_tax_rates(worker_id: int, payload: UpdateTaxRatesRequest, db: Session = Depends(get_db)):
    service = ContractService(db)
    try:
        return service.update_tax_rates(
            worker_id=worker_id,
            onss_employee_rate=payload.onss_employee_rate,
            onss_employer_rate=payload.onss_employer_rate,
            precompte_rate=payload.precompte_rate
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.patch("/worker/{worker_id}/terminate", response_model=ContractResponse)
def terminate_contract(worker_id: int, payload: TerminateContractRequest, db: Session = Depends(get_db)):
    service = ContractService(db)
    try:
        return service.terminate_contract(worker_id, payload.end_date)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))