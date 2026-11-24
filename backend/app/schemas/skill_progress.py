
from typing import Optional
from pydantic import BaseModel, Field


class SkillProgressCreate(BaseModel):
    skill_name: str = Field(..., min_length=2)
    progress: int = Field(default=0, ge=0, le=100)


class SkillProgressUpdate(BaseModel):
    progress: Optional[int] = Field(default=None, ge=0, le=100)
    completed: Optional[bool] = None
