import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

load_dotenv()

DATABASE_URL = os.getenv('DATABASE_URL')

# On crée l'engine
engine = create_engine(DATABASE_URL, echo=True)

# On crée l'usine à sessions
SessionLocal = sessionmaker(bind=engine)

# ON DÉFINIT LA CLASSE BASE ICI
class Base(DeclarativeBase):
    pass