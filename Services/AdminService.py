from sqlalchemy.orm import Session
from Repositories.AdminRepository import AdminRepository
from Models.Admin import Admin
import base64
import hashlib
import os
import secrets

class AdminService:

    def __init__(self, db: Session):
        self.admin_repo = AdminRepository(db)

    def _hash_password(self, password: str) -> str:
        salt = os.urandom(16)
        derived_key = hashlib.pbkdf2_hmac(
            "sha256",
            password.encode("utf-8"),
            salt,
            100_000
        )
        return base64.b64encode(salt + derived_key).decode("utf-8")

    def _verify_password(self, plain: str, hashed: str) -> bool:
        decoded = base64.b64decode(hashed.encode("utf-8"))
        salt = decoded[:16]
        stored_key = decoded[16:]
        derived_key = hashlib.pbkdf2_hmac(
            "sha256",
            plain.encode("utf-8"),
            salt,
            100_000
        )
        return secrets.compare_digest(derived_key, stored_key)

    def create_admin(self, email: str, password: str) -> Admin:
        """Crée un compte admin"""
        existing = self.admin_repo.get_by_email(email)
        if existing:
            raise ValueError(f"Un admin avec l'email {email} existe déjà")

        if len(password) < 8:
            raise ValueError("Le mot de passe doit faire au moins 8 caractères")

        admin = Admin(
            email=email,
            password=self._hash_password(password)
        )
        return self.admin_repo.create(admin)

    def login(self, email: str, password: str) -> Admin:
        """Vérifie les credentials d'un admin"""
        admin = self.admin_repo.get_by_email(email)
        if not admin:
            raise ValueError("Email ou mot de passe incorrect")

        if not self._verify_password(password, admin.password):
            raise ValueError("Email ou mot de passe incorrect")

        return admin

    def change_password(self, admin_id: int, old_password: str, new_password: str) -> Admin:
        """Change le mot de passe d'un admin"""
        admin = self.admin_repo.get_by_id(admin_id)
        if not admin:
            raise ValueError(f"Admin {admin_id} introuvable")

        if not self._verify_password(old_password, admin.password):
            raise ValueError("Ancien mot de passe incorrect")

        if len(new_password) < 8:
            raise ValueError("Le nouveau mot de passe doit faire au moins 8 caractères")

        admin.password = self._hash_password(new_password)
        return self.admin_repo.update(admin)

    def delete_admin(self, admin_id: int) -> None:
        """Supprime un admin — vérifie qu'il en reste au moins un"""
        admin = self.admin_repo.get_by_id(admin_id)
        if not admin:
            raise ValueError(f"Admin {admin_id} introuvable")

        all_admins = self.admin_repo.get_all()
        if len(all_admins) <= 1:
            raise ValueError("Impossible de supprimer le dernier admin")

        self.admin_repo.delete(admin)