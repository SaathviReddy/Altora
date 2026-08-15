import sys
import os
# Ensure root workspace is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.core.config import settings
from backend.database.db import engine, init_db
from backend.database.base import Base
from backend.api import (
    auth,
    users,
    business,
    memory,
    advisor,
    finance,
    inventory,
    milestones,
    tasks,
    chat,
    notifications,
    realtime
)

# Auto-create & migrate tables for local development
init_db()

app = FastAPI(
    title="Altora / FounderOS Backend API",
    description="Production FastAPI service powering Altora Founder Operating System",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Configuration
origins = [
    settings.FRONTEND_URL,
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
api_v1_prefix = "/api/v1"
app.include_router(auth.router, prefix=api_v1_prefix)
app.include_router(users.router, prefix=api_v1_prefix)
app.include_router(business.router, prefix=api_v1_prefix)
app.include_router(memory.router, prefix=api_v1_prefix)
app.include_router(advisor.router, prefix=api_v1_prefix)
app.include_router(finance.router, prefix=api_v1_prefix)
app.include_router(inventory.router, prefix=api_v1_prefix)
app.include_router(milestones.router, prefix=api_v1_prefix)
app.include_router(tasks.router, prefix=api_v1_prefix)
app.include_router(chat.router, prefix=api_v1_prefix)
app.include_router(notifications.router, prefix=api_v1_prefix)
app.include_router(realtime.router)  # Handles /ws directly

@app.get("/health")
def health_check():
    return {
        "success": True,
        "data": {
            "status": "healthy",
            "environment": settings.ENVIRONMENT
        },
        "error": None
    }

@app.get("/")
def root():
    return {
        "success": True,
        "data": {
            "name": "Altora FounderOS API",
            "version": "1.0.0",
            "documentation": "/docs"
        },
        "error": None
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=settings.PORT, reload=True)
