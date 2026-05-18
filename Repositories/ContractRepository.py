# repositories/contract_repository.py
from sqlalchemy.orm import Session
from Models.Contract import Contract

class ContractRepository:
    
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, contract_id: int) -> Contract | None:
        return self.db.query(Contract).filter(Contract.id == contract_id).first()

    def get_by_worker_id(self, worker_id: int) -> Contract | None:
        return self.db.query(Contract).filter(Contract.worker_id == worker_id).first()

    def create(self, contract: Contract) -> Contract:
        self.db.add(contract)
        self.db.commit()
        self.db.refresh(contract)
        return contract

    def update(self, contract: Contract) -> Contract:
        self.db.commit()
        self.db.refresh(contract)
        return contract

    def delete(self, contract: Contract) -> None:
        self.db.delete(contract)
        self.db.commit()