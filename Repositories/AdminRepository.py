from sqlalchemy.orm import Session
from Models.Admin import Admin

class AdminRepository:
    
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, admin_id: int) -> Admin | None:
        return self.db.query(Admin).filter(Admin.id == admin_id).first()

    def get_by_email(self, email: str) -> Admin | None:
        return self.db.query(Admin).filter(Admin.email == email).first()

    def get_all(self) -> list[Admin]:
        return self.db.query(Admin).all()

    def create(self, admin: Admin) -> Admin:
        self.db.add(admin)
        self.db.commit()
        self.db.refresh(admin)
        return admin

    def update(self, admin: Admin) -> Admin:
        self.db.commit()
        self.db.refresh(admin)
        return admin

    def delete(self, admin: Admin) -> None:
        self.db.delete(admin)
        self.db.commit()