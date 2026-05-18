from db.database import Base
from sqlalchemy import ForeignKey, String, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship


class Admin(Base) :
    __tablename__='admin'
    id:Mapped[int]=mapped_column(primary_key=True)
    email:Mapped[str]=mapped_column(String(30),nullable=False,unique=True)
    password:Mapped[str]=mapped_column(String(255), nullable=False)

    
