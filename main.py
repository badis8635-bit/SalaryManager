from fastapi import FastAPI
from db.database import Base, engine
from Routes.WorkerRoute import router as worker_router

# Importer tous les modèles pour que SQLAlchemy les connaisse
import Models.Worker
import Models.Contract
import Models.Payslip
import Models.Admin

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Salary Manager API")
app.include_router(worker_router)