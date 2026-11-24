
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.database.connection import (
    connect_to_mongodb,
    close_mongodb_connection
)

# Existing API routers
from app.api.routes.auth import router as auth_router
from app.api.routes.resume import router as resume_router
from app.api.routes.analysis import router as analysis_router
from app.api.routes.job_matching import router as job_matching_router
from app.api.routes.skill_gap import router as skill_gap_router
from app.api.routes.resume_builder import router as resume_builder_router
from app.api.routes.resume_export import router as resume_export_router
from app.api.routes.resume_versions import router as resume_versions_router
from app.api.routes.resume_comparison import router as resume_comparison_router
from app.api.routes.ats_tracker import router as ats_tracker_router
from app.api.routes.mock_interview import router as mock_interview_router
from app.api.routes.resume_analytics import router as resume_analytics_router
from app.api.routes.career_agent import router as career_agent_router
from app.api.routes.job_recommendation import router as job_recommendation_router
from app.api.routes.skill_progress import router as skill_progress_router

# New Learning Tracker router
from app.api.routes.learning import router as learning_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_to_mongodb()
    yield
    await close_mongodb_connection()


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="AI-powered Resume and Career Intelligence Platform",
    lifespan=lifespan
)


# Frontend connection
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# API Routes
app.include_router(auth_router, prefix=settings.API_V1_PREFIX)
app.include_router(resume_router, prefix=settings.API_V1_PREFIX)
app.include_router(analysis_router, prefix=settings.API_V1_PREFIX)
app.include_router(job_matching_router, prefix=settings.API_V1_PREFIX)
app.include_router(skill_gap_router, prefix=settings.API_V1_PREFIX)
app.include_router(resume_builder_router, prefix=settings.API_V1_PREFIX)
app.include_router(resume_export_router, prefix=settings.API_V1_PREFIX)
app.include_router(resume_versions_router, prefix=settings.API_V1_PREFIX)
app.include_router(resume_comparison_router, prefix=settings.API_V1_PREFIX)
app.include_router(career_agent_router, prefix=settings.API_V1_PREFIX)
app.include_router(mock_interview_router, prefix=settings.API_V1_PREFIX)
app.include_router(ats_tracker_router, prefix=settings.API_V1_PREFIX)
app.include_router(resume_analytics_router, prefix=settings.API_V1_PREFIX)
app.include_router(job_recommendation_router, prefix=settings.API_V1_PREFIX)
app.include_router(
    skill_progress_router,
    prefix=settings.API_V1_PREFIX
)
# Module 12: AI Career Roadmap & Learning Tracker
app.include_router(learning_router, prefix=settings.API_V1_PREFIX)


@app.get("/")
async def root():
    return {
        "success": True,
        "message": "Welcome to RESUMIND AI Backend!",
        "version": settings.VERSION
    }


@app.get("/health")
async def health_check():
    return {
        "success": True,
        "status": "healthy",
        "project": settings.PROJECT_NAME,
        "database": settings.DATABASE_NAME
    }
