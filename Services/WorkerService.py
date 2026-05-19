from sqlalchemy.orm import Session
from Repositories.WorkerRepository import WorkerRepository
from Repositories.ContractRepository import ContractRepository
from Models.Worker import Worker, WorkerType
from decimal import Decimal

class WorkerService:

    def __init__(self, db: Session):
        self.worker_repo = WorkerRepository(db)
        self.contract_repo = ContractRepository(db)

    def create_worker(self, email: str, first_name: str, last_name: str, worker_type: WorkerType) -> Worker:
        """Crée un nouveau worker"""
        existing = self.worker_repo.get_by_email(email)
        if existing:
            raise ValueError(f"Un worker avec l'email {email} existe déjà")

        worker = Worker(
            email=email,
            first_name=first_name,
            last_name=last_name,
            worker_type=worker_type,
            is_active=True
        )
        return self.worker_repo.create(worker)

    def deactivate_worker(self, worker_id: int) -> Worker:
        """Désactive un worker sans le supprimer pour conserver l'historique"""
        worker = self.worker_repo.get_by_id(worker_id)
        if not worker:
            raise ValueError(f"Worker {worker_id} introuvable")
        if not worker.is_active:
            raise ValueError(f"Worker {worker_id} est déjà inactif")

        worker.is_active = False
        return self.worker_repo.update(worker)

    def activate_worker(self, worker_id: int) -> Worker:
        """Réactive un worker"""
        worker = self.worker_repo.get_by_id(worker_id)
        if not worker:
            raise ValueError(f"Worker {worker_id} introuvable")
        if worker.is_active:
            raise ValueError(f"Worker {worker_id} est déjà actif")

        worker.is_active = True
        return self.worker_repo.update(worker)

    def update_worker(self, worker_id: int, **kwargs) -> Worker:
        """Met à jour les infos d'un worker"""
        worker = self.worker_repo.get_by_id(worker_id)
        if not worker:
            raise ValueError(f"Worker {worker_id} introuvable")

        allowed_fields = {"email", "first_name", "last_name", "worker_type"}
        for key, value in kwargs.items():
            if key not in allowed_fields:
                raise ValueError(f"Champ {key} non modifiable")
            if key == "email":
                existing = self.worker_repo.get_by_email(value)
                if existing and existing.id != worker_id:
                    raise ValueError(f"Email {value} déjà utilisé")
            setattr(worker, key, value)

        return self.worker_repo.update(worker)

    def get_worker_with_contract(self, worker_id: int) -> dict:
        """Retourne un worker avec son contrat"""
        worker = self.worker_repo.get_by_id(worker_id)
        if not worker:
            raise ValueError(f"Worker {worker_id} introuvable")

        contract = self.contract_repo.get_by_worker_id(worker_id)
        return {
            "worker": worker,
            "contract": contract
        }

    def get_all_active(self) -> list[Worker]:
        return self.worker_repo.get_all_active()

    def get_all(self) -> list[Worker]:
        return self.worker_repo.get_all()

    def delete_worker(self, worker_id: int) -> None:
        """Supprime un worker — uniquement si aucune fiche de paie n'existe"""
        worker = self.worker_repo.get_by_id(worker_id)
        if not worker:
            raise ValueError(f"Worker {worker_id} introuvable")

        contract = self.contract_repo.get_by_worker_id(worker_id)
        if contract:
            raise ValueError("Impossible de supprimer un worker avec un contrat actif, désactivez-le plutôt")

        self.worker_repo.delete(worker)