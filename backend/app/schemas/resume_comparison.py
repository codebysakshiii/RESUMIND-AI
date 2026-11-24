
from pydantic import BaseModel, Field


class ResumeComparisonRequest(BaseModel):
    resume_id: str = Field(..., min_length=1)
    old_version_id: str = Field(..., min_length=1)
    new_version_id: str = Field(..., min_length=1)


class ResumeComparisonResponse(BaseModel):
    success: bool
    message: str
    comparison: dict
