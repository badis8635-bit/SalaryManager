from __future__ import annotations
from db.database import Base
from sqlalchemy import String, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from enum import Enum as PyEnum
from typing import TYPE_CHECKING
if TYPE_CHECKING:
    from Models.Contract import Contract
    from Models.Payslip import Payslip

class WorkerType(PyEnum):
    EMPLOYEE  = "employee"
    FREELANCE = "freelance"
    ETDUIANT  = "etudiant"

class Worker(Base):
    __tablename__ = 'worker'

    id:         Mapped[int]  = mapped_column(primary_key=True)
    email:      Mapped[str]  = mapped_column(String(255), nullable=False, unique=True)
    first_name: Mapped[str]  = mapped_column(String(50),  nullable=False)
    last_name:  Mapped[str]  = mapped_column(String(50),  nullable=False)
    is_active:  Mapped[bool] = mapped_column(nullable=False, default=False)
    worker_type:Mapped[WorkerType] = mapped_column(Enum(WorkerType), nullable=False)
    # ← nouveau : nullable pour ne pas casser les workers existants
    password:   Mapped[str | None] = mapped_column(String(255), nullable=True, default=None)

    contract: Mapped["Contract"]       = relationship("Contract", back_populates="worker")
    payslips: Mapped[list["Payslip"]]  = relationship("Payslip",  back_populates="worker")