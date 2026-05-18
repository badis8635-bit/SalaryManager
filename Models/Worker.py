from db.database import Base
from sqlalchemy import String, Enum
from sqlalchemy.orm import Mapped, mapped_column
from enum import Enum as PyEnum

class WorkerType(PyEnum):
    EMPLOYEE = "employee"
    FREELANCE = "freelance"
    ETDUIANT = "etudiant"

class Worker(Base):
    __tablename__ = 'worker'

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    first_name: Mapped[str] = mapped_column(String(50), nullable=False)
    last_name: Mapped[str] = mapped_column(String(50), nullable=False)
    is_active: Mapped[bool] = mapped_column(nullable=False, default=False)
    worker_type: Mapped[WorkerType] = mapped_column(Enum(WorkerType), nullable=False)