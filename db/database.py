from sqlalchemy.engine import URL
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

DATABASE_URL = URL.create(
    drivername="postgresql+pg8000",
    username="postgres",
    password="postgres",
    host="localhost",
    port=5432,
    database="SalaryManager"
)

engine = create_engine(DATABASE_URL, echo=True)
SessionLocal = sessionmaker(bind=engine)

class Base(DeclarativeBase):
    pass