
from pydantic import BaseModel
from typing import Optional


class ResumeAnalyticsResponse(BaseModel):
    success: bool
    message: str
    total_resumes: int
    total_analyses: int
    average_ats_score: float
    highest_ats_score: float
    lowest_ats_score: float
    total_resume_versions: int
    total_job_matches: int
    total_skill_gap_analyses: int
    score_history: list[dict]
