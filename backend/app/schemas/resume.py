
from pydantic import BaseModel
from typing import Optional


class ResumeUploadResponse(BaseModel):
    success: bool
    message: str
    resume_id: str
    filename: str
    file_type: str
    text_length: int
    preview: Optional[str] = None
