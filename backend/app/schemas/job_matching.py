
from pydantic import BaseModel, Field


class JobMatchRequest(BaseModel):
    resume_id: str = Field(..., min_length=1)
    job_description: str = Field(..., min_length=50)


class JobMatchResponse(BaseModel):
    success: bool
    message: str
    match_id: str
    resume_id: str
    result: dict
