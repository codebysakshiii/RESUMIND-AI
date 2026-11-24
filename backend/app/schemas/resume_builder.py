
from typing import Literal, Optional

from pydantic import BaseModel, Field


class ResumeBuilderRequest(BaseModel):
    resume_id: str = Field(..., min_length=1)

    target_role: Optional[str] = Field(
        default=None,
        max_length=100
    )

    template: Literal[
        "professional",
        "modern",
        "minimal"
    ] = "professional"


class ResumeBuilderResponse(BaseModel):
    success: bool
    message: str
    builder_id: str
    resume_id: str
    result: dict
