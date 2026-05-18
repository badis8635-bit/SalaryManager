from sqlalchemy.orm import Session

from Models.Worker import Worker


class WorkerRepository:
    
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, worker_id: int) -> Worker | None:
        return self.db.query(Worker).filter(Worker.id == worker_id).first()

    def get_by_email(self, email: str) -> Worker | None:
        return self.db.query(Worker).filter(Worker.email == email).first()

    def get_all(self) -> list[Worker]:
        return self.db.query(Worker).all()

    def get_all_active(self) -> list[Worker]:
        return self.db.query(Worker).filter(Worker.is_active == True).all()

    def create(self, worker: Worker) -> Worker:
        self.db.add(worker)
        self.db.commit()
        self.db.refresh(worker)
        return worker

    def update(self, worker: Worker) -> Worker:
        self.db.commit()
        self.db.refresh(worker)
        return worker

    def delete(self, worker: Worker) -> None:
        self.db.delete(worker)
        self.db.commit()