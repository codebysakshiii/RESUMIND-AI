
from datetime import date
from typing import List, Optional

from pydantic import BaseModel, Field


class LearningRoadmapRequest(BaseModel):
    target_role: str = Field(..., min_length=2)
    current_skills: List[str] = Field(default_factory=list)
    target_skills: List[str] = Field(default_factory=list)
    daily_study_hours: float = Field(default=2, gt=0, le=24)
    duration_weeks: int = Field(default=8, ge=1, le=52)


class LearningGoalCreate(BaseModel):
    title: str = Field(..., min_length=2)
    description: Optional[str] = None
    skill: Optional[str] = None
    due_date: date


class LearningGoalUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    skill: Optional[str] = None
    due_date: Optional[date] = None
    completed: Optional[bool] = None


class LearningRoadmapResponse(BaseModel):
    success: bool
    message: str
    roadmap: dict


class LearningGoalsResponse(BaseModel):
    success: bool
    message: str
    total_goals: int
    completed_goals: int
    pending_goals: int
    goals: list
