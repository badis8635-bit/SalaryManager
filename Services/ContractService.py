from sqlalchemy.orm import Session
from Repositories.ContractRepository import ContractRepository
from Repositories.WorkerRepository import WorkerRepository
from Models.Contract import Contract, ContractType
from decimal import Decimal
from datetime import date

class ContractService:

    def __init__(self, db: Session):
        self.contract_repo = ContractRepository(db)
        self.worker_repo = WorkerRepository(db)

    def create_contract(
        self,
        worker_id: int,
        contract_type: ContractType,
        gross_salary: Decimal,
        start_date: date,
        end_date: date = None,
        onss_employee_rate: Decimal = Decimal("13.07"),
        onss_employer_rate: Decimal = Decimal("27.00"),
        precompte_rate: Decimal = Decimal("26.75")
    ) -> Contract:
        """Crée un contrat pour un worker"""
        worker = self.worker_repo.get_by_id(worker_id)
        if not worker:
            raise ValueError(f"Worker {worker_id} introuvable")

        existing = self.contract_repo.get_by_worker_id(worker_id)
        if existing:
            raise ValueError(f"Un contrat existe déjà pour le worker {worker_id}")

        if gross_salary <= 0:
            raise ValueError("Le salaire brut doit être positif")

        if end_date and end_date <= start_date:
            raise ValueError("La date de fin doit être après la date de début")

        if contract_type == ContractType.CDI and end_date:
            raise ValueError("Un CDI ne peut pas avoir de date de fin")

        contract = Contract(
            worker_id=worker_id,
            contract_type=contract_type,
            gross_salary=gross_salary,
            start_date=start_date,
            end_date=end_date,
            onss_employee_rate=onss_employee_rate,
            onss_employer_rate=onss_employer_rate,
            precompte_rate=precompte_rate
        )
        return self.contract_repo.create(contract)

    def update_salary(self, worker_id: int, new_gross_salary: Decimal) -> Contract:
        """Met à jour le salaire brut d'un contrat"""
        contract = self.contract_repo.get_by_worker_id(worker_id)
        if not contract:
            raise ValueError(f"Aucun contrat trouvé pour le worker {worker_id}")

        if new_gross_salary <= 0:
            raise ValueError("Le salaire brut doit être positif")

        contract.gross_salary = new_gross_salary
        return self.contract_repo.update(contract)

    def update_tax_rates(
        self,
        worker_id: int,
        onss_employee_rate: Decimal = None,
        onss_employer_rate: Decimal = None,
        precompte_rate: Decimal = None
    ) -> Contract:
        """Met à jour les taux de cotisation d'un contrat"""
        contract = self.contract_repo.get_by_worker_id(worker_id)
        if not contract:
            raise ValueError(f"Aucun contrat trouvé pour le worker {worker_id}")

        if onss_employee_rate is not None:
            contract.onss_employee_rate = onss_employee_rate
        if onss_employer_rate is not None:
            contract.onss_employer_rate = onss_employer_rate
        if precompte_rate is not None:
            contract.precompte_rate = precompte_rate

        return self.contract_repo.update(contract)

    def get_contract_cost(self, worker_id: int) -> dict:
        """Calcule le coût total employeur d'un worker"""
        contract = self.contract_repo.get_by_worker_id(worker_id)
        if not contract:
            raise ValueError(f"Aucun contrat trouvé pour le worker {worker_id}")

        onss_employer = round(contract.gross_salary * (contract.onss_employer_rate / 100), 2)
        total_cost = contract.gross_salary + onss_employer

        return {
            "gross_salary": contract.gross_salary,
            "onss_employer": onss_employer,
            "total_employer_cost": total_cost
        }

    def terminate_contract(self, worker_id: int, end_date: date) -> Contract:
        """Termine un contrat en ajoutant une date de fin"""
        contract = self.contract_repo.get_by_worker_id(worker_id)
        if not contract:
            raise ValueError(f"Aucun contrat trouvé pour le worker {worker_id}")

        if contract.contract_type == ContractType.CDI:
            raise ValueError("Un CDI ne peut pas avoir de date de fin, utilisez la désactivation du worker")

        if end_date <= contract.start_date:
            raise ValueError("La date de fin doit être après la date de début")

        contract.end_date = end_date
        return self.contract_repo.update(contract)

    def get_by_worker_id(self, worker_id: int) -> Contract:
        contract = self.contract_repo.get_by_worker_id(worker_id)
        if not contract:
            raise ValueError(f"Aucun contrat trouvé pour le worker {worker_id}")
        return contract