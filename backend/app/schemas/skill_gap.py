
from pydantic import BaseModel, Field


class SkillGapRequest(BaseModel):
    resume_id: str = Field(..., min_length=1)
    job_description: str = Field(..., min_length=50)


class SkillGapResponse(BaseModel):
    success: bool
    message: str
    skill_gap_id: str
    resume_id: str
    result: dict
