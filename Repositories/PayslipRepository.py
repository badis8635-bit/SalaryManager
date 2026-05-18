from sqlalchemy.orm import Session
from Models.Payslip import Payslip, PayslipStatus

class PayslipRepository:
    
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, payslip_id: int) -> Payslip | None:
        return self.db.query(Payslip).filter(Payslip.id == payslip_id).first()

    def get_all_by_worker(self, worker_id: int) -> list[Payslip]:
        return self.db.query(Payslip).filter(Payslip.worker_id == worker_id).all()

    def get_all_pending(self) -> list[Payslip]:
        return self.db.query(Payslip).filter(Payslip.status == PayslipStatus.PENDING).all()

    def get_all_paid(self) -> list[Payslip]:
        return self.db.query(Payslip).filter(Payslip.status == PayslipStatus.PAID).all()

    def get_by_period(self, month: int, year: int) -> list[Payslip]:
        return self.db.query(Payslip).filter(
            Payslip.period_month == month,
            Payslip.period_year == year
        ).all()

    def create(self, payslip: Payslip) -> Payslip:
        self.db.add(payslip)
        self.db.commit()
        self.db.refresh(payslip)
        return payslip

    def update(self, payslip: Payslip) -> Payslip:
        self.db.commit()
        self.db.refresh(payslip)
        return payslip

    def delete(self, payslip: Payslip) -> None:
        self.db.delete(payslip)
        self.db.commit()