from fastapi import FastAPI
from db.database import Base, engine
from Routes.WorkerRoute import router as worker_router
from Routes.AdminRoute import router as admin_router
from Routes.ContractRoute import router as contract_router
from Routes.PayslipRoute import router as payslip_router

import Models.Worker
import Models.Contract
import Models.Payslip
import Models.Admin
from fastapi.middleware.cors import CORSMiddleware



Base.metadata.create_all(bind=engine)

app = FastAPI(title="Salary Manager API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(worker_router)
app.include_router(admin_router)
app.include_router(contract_router)
app.include_router(payslip_router)
