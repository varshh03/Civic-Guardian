from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
import os

from app.config import get_settings
from app.routers import auth, detect, complaints, comments, social, notifications, officer, admin, community

def create_app() -> FastAPI:
    settings = get_settings()
    
    app = FastAPI(
        title="AI Civic Guardian API",
        description="Bilingual civic issue reporting for Karur Municipality",
        version="1.0.0"
    )
    
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    Path(settings.upload_dir).mkdir(exist_ok=True)
    Path(settings.data_dir).mkdir(exist_ok=True)
    
    app.mount("/uploads", StaticFiles(directory=settings.upload_dir), name="uploads")
    
    app.include_router(auth.router, prefix="/auth", tags=["auth"])
    app.include_router(detect.router, tags=["detect"])
    app.include_router(complaints.router, prefix="/complaints", tags=["complaints"])
    app.include_router(comments.router, tags=["comments"])
    app.include_router(notifications.router, prefix="/notifications", tags=["notifications"])
    app.include_router(officer.router, prefix="/officer", tags=["officer"])
    app.include_router(admin.router, prefix="/admin", tags=["admin"])
    app.include_router(community.router, tags=["community"])
    app.include_router(community.router, prefix="/community", tags=["community"])
    
    @app.get("/health")
    async def health():
        return {"status": "ok", "version": "1.0.0"}
    
    @app.get("/departments")
    async def get_departments():
        from app.repos.json_repo import DepartmentRepo
        repo = DepartmentRepo(Path(settings.data_dir))
        return repo.all()

    @app.get("/stats/public")
    async def get_public_stats():
        from app.repos.json_repo import ComplaintRepo
        from app.models import ComplaintStatus
        repo = ComplaintRepo(Path(settings.data_dir))
        complaints = repo.all()
        total = len(complaints)
        resolved = sum(1 for c in complaints if c.status == ComplaintStatus.Resolved)
        in_progress = sum(1 for c in complaints if c.status in [ComplaintStatus.InProgress, ComplaintStatus.Acknowledged])
        return {
            "total_reports": total,
            "resolved_count": resolved,
            "in_progress_count": in_progress,
            "avg_resolution_hours": 36
        }

    
    @app.on_event("startup")
    async def startup():
        data_dir = Path(settings.data_dir)
        users_file = data_dir / 'users.json'
        if not users_file.exists() or os.path.getsize(users_file) < 10:
            import subprocess, sys
            try:
                if (Path("app") / "seed.py").exists():
                    subprocess.run([sys.executable, "-m", "app.seed"], check=False)
            except Exception:
                pass
    
    return app

app = create_app()
