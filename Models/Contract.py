from datetime import date
from decimal import Decimal

from Models.Worker import Worker
from db.database import Base
from sqlalchemy import ForeignKey, String, Numeric, Enum, Date
from sqlalchemy.orm import Mapped, mapped_column, relationship
from enum import Enum as PyEnum

class ContractType(PyEnum):
    EMPLOYEE = "employee"
    FREELANCE = "freelance"
    ETUDIANT = "etudiant"

class Contract(Base):
    __tablename__ = 'contract'

    id: Mapped[int] = mapped_column(primary_key=True)
    worker_id: Mapped[int] = mapped_column(ForeignKey('worker.id'), nullable=False)
    contract_type: Mapped[ContractType] = mapped_column(Enum(ContractType), nullable=False)
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[date] = mapped_column(Date, nullable=True)
    gross_salary: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    onss_employee_rate: Mapped[Decimal] = mapped_column(Numeric(5, 2), nullable=False, default=13.07)
    onss_employer_rate: Mapped[Decimal] = mapped_column(Numeric(5, 2), nullable=False, default=27.00)
    precompte_rate: Mapped[Decimal] = mapped_column(Numeric(5, 2), nullable=False, default=26.75)
    worker: Mapped["Worker"] = relationship("Worker", back_populates="contract")