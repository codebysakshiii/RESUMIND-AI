
from typing import Literal, Optional

from pydantic import BaseModel, Field


class JobListingCreate(BaseModel):
    title: str = Field(..., min_length=2)
    company: str = Field(..., min_length=2)
    description: str = Field(..., min_length=20)

    job_type: Literal["job", "internship"]

    location: str = Field(default="Remote")
    work_mode: Literal["remote", "hybrid", "onsite"]

    experience_level: Literal[
        "fresher",
        "beginner",
        "intermediate",
        "experienced"
    ]

    apply_url: Optional[str] = None


class JobRecommendationRequest(BaseModel):
    resume_id: str = Field(..., min_length=1)
    target_role: str = Field(..., min_length=2)

    job_type: Literal[
        "job",
        "internship",
        "both"
    ] = "both"

    location: Optional[str] = None

    work_mode: Literal[
        "remote",
        "hybrid",
        "onsite",
        "any"
    ] = "any"


class ApplicationStatusUpdate(BaseModel):
    status: Literal[
        "saved",
        "applied",
        "interview",
        "rejected",
        "offered"
    ]


class JobRecommendationResponse(BaseModel):
    success: bool
    message: str
    recommendations: list[dict]
