# services/payslip_service.py
from sqlalchemy.orm import Session
from Repositories.PayslipRepository import PayslipRepository
from Repositories.WorkerRepository import WorkerRepository
from Repositories.ContractRepository import ContractRepository
from Models.Payslip import Payslip, PayslipStatus
from decimal import Decimal
from datetime import date

class PayslipService:

    def __init__(self, db: Session):
        self.payslip_repo = PayslipRepository(db)
        self.worker_repo = WorkerRepository(db)
        self.contract_repo = ContractRepository(db)

    def _calculate_payslip(self, gross_salary: Decimal, bonus: Decimal, contract) -> dict:
        """Calcule tous les montants d'une fiche de paie"""
        base = gross_salary + bonus

        onss_employee = round(base * (contract.onss_employee_rate / 100), 2)
        onss_employer = round(base * (contract.onss_employer_rate / 100), 2)
        precompte = round((base - onss_employee) * (contract.precompte_rate / 100), 2)
        net_salary = round(base - onss_employee - precompte, 2)

        return {
            "gross_salary": gross_salary,
            "bonus": bonus,
            "onss_employee": onss_employee,
            "onss_employer": onss_employer,
            "precompte": precompte,
            "net_salary": net_salary
        }

    def generate_payslip(self, worker_id: int, month: int, year: int, bonus: Decimal = Decimal("0")) -> Payslip:
        """Génère une fiche de paie pour un worker sur une période donnée"""

        # Vérifications
        worker = self.worker_repo.get_by_id(worker_id)
        if not worker:
            raise ValueError(f"Worker {worker_id} introuvable")
        if not worker.is_active:
            raise ValueError(f"Worker {worker_id} inactif")

        contract = self.contract_repo.get_by_worker_id(worker_id)
        if not contract:
            raise ValueError(f"Aucun contrat trouvé pour le worker {worker_id}")

        # Vérifier si une fiche existe déjà pour cette période
        existing = self.payslip_repo.get_by_period(month, year)
        already_exists = any(p.worker_id == worker_id for p in existing)
        if already_exists:
            raise ValueError(f"Une fiche de paie existe déjà pour ce worker sur {month}/{year}")

        # Calcul
        amounts = self._calculate_payslip(contract.gross_salary, bonus, contract)

        # Création
        payslip = Payslip(
            worker_id=worker_id,
            contract_id=contract.id,
            status=PayslipStatus.PENDING,
            period_month=month,
            period_year=year,
            period_status="open",
            **amounts
        )

        return self.payslip_repo.create(payslip)

    def generate_payslips_for_period(self, month: int, year: int) -> list[Payslip]:
        """Génère les fiches de paie pour TOUS les workers actifs d'un mois"""
        workers = self.worker_repo.get_all_active()
        payslips = []

        for worker in workers:
            try:
                payslip = self.generate_payslip(worker.id, month, year)
                payslips.append(payslip)
            except ValueError:
                continue  # Skip les workers sans contrat ou déjà payés

        return payslips

    def mark_as_paid(self, payslip_id: int) -> Payslip:
        """Marque une fiche de paie comme payée"""
        payslip = self.payslip_repo.get_by_id(payslip_id)
        if not payslip:
            raise ValueError(f"Payslip {payslip_id} introuvable")
        if payslip.status == PayslipStatus.PAID:
            raise ValueError("Cette fiche est déjà payée")
        if payslip.status == PayslipStatus.CANCELLED:
            raise ValueError("Impossible de payer une fiche annulée")

        payslip.status = PayslipStatus.PAID
        payslip.paid_at = date.today()
        payslip.period_status = "closed"
        return self.payslip_repo.update(payslip)

    def cancel_payslip(self, payslip_id: int) -> Payslip:
        """Annule une fiche de paie"""
        payslip = self.payslip_repo.get_by_id(payslip_id)
        if not payslip:
            raise ValueError(f"Payslip {payslip_id} introuvable")
        if payslip.status == PayslipStatus.PAID:
            raise ValueError("Impossible d'annuler une fiche déjà payée")

        payslip.status = PayslipStatus.CANCELLED
        return self.payslip_repo.update(payslip)

    def get_history_by_worker(self, worker_id: int) -> list[Payslip]:
        """Historique complet des fiches d'un worker"""
        worker = self.worker_repo.get_by_id(worker_id)
        if not worker:
            raise ValueError(f"Worker {worker_id} introuvable")
        return self.payslip_repo.get_all_by_worker(worker_id)

    def get_pending_payslips(self) -> list[Payslip]:
        """Liste des fiches en attente de paiement"""
        return self.payslip_repo.get_all_pending()

    def get_period_summary(self, month: int, year: int) -> dict:
        """Résumé financier d'une période"""
        payslips = self.payslip_repo.get_by_period(month, year)

        return {
            "period": f"{month}/{year}",
            "total_workers": len(payslips),
            "total_gross": sum(p.gross_salary for p in payslips),
            "total_bonus": sum(p.bonus for p in payslips),
            "total_net": sum(p.net_salary for p in payslips),
            "total_onss_employer": sum(p.onss_employer for p in payslips),
            "total_cost": sum(p.gross_salary + p.onss_employer for p in payslips),
            "paid_count": sum(1 for p in payslips if p.status == PayslipStatus.PAID),
            "pending_count": sum(1 for p in payslips if p.status == PayslipStatus.PENDING),
        }