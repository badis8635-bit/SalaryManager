from Models.Contract import Contract
from Models.Worker import Worker
from db.database import Base
from sqlalchemy import ForeignKey, Numeric, Enum, Date
from sqlalchemy.orm import Mapped, mapped_column, relationship
from enum import Enum as PyEnum
from datetime import date
from decimal import Decimal

class PayslipStatus(PyEnum):
    PENDING = "pending"
    PAID = "paid"
    CANCELLED = "cancelled"

class Payslip(Base):
    __tablename__ = 'payslip'

    id: Mapped[int] = mapped_column(primary_key=True)
    worker_id: Mapped[int] = mapped_column(ForeignKey('worker.id'), nullable=False)
    contract_id: Mapped[int] = mapped_column(ForeignKey('contract.id'), nullable=False)
    amount: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    period_month: Mapped[int] = mapped_column(nullable=False)
    period_year: Mapped[int] = mapped_column(nullable=False)
    status: Mapped[PayslipStatus] = mapped_column(Enum(PayslipStatus), nullable=False, default=PayslipStatus.PENDING)
    paid_at: Mapped[date] = mapped_column(Date, nullable=True)

    worker: Mapped["Worker"] = relationship("Worker", back_populates="payslips")
    contract: Mapped["Contract"] = relationship("Contract", back_populates="payslips")