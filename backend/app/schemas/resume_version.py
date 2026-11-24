from typing import List, Optional
from pydantic import BaseModel


class ResumeVersionItem(BaseModel):
    builder_id: str
    resume_id: str
    version: int
    target_role: Optional[str] = None
    template: str
    created_at: Optional[str] = None


class ResumeVersionListResponse(BaseModel):
    success: bool
    message: str
    resume_id: str
    total_versions: int
    versions: List[ResumeVersionItem]