
from pydantic import BaseModel, Field


class CareerPlanRequest(BaseModel):
    resume_id: str = Field(..., min_length=1)
    target_role: str = Field(..., min_length=2)
    weekly_hours: int = Field(default=10, ge=1, le=60)
    experience_level: str = Field(default="fresher")


class CareerPlanResponse(BaseModel):
    success: bool
    message: str
    plan: dict
