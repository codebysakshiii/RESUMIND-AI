
from pydantic import BaseModel, Field


class InterviewStartRequest(BaseModel):
    resume_id: str = Field(..., min_length=1)
    target_role: str = Field(..., min_length=2)
    difficulty: str = Field(default="intermediate")
    question_count: int = Field(default=5, ge=1, le=10)


class InterviewStartResponse(BaseModel):
    success: bool
    message: str
    session_id: str
    questions: list[dict]


class InterviewAnswerRequest(BaseModel):
    question_id: str = Field(..., min_length=1)
    question: str = Field(..., min_length=5)
    answer: str = Field(..., min_length=5)


class InterviewAnswerResponse(BaseModel):
    success: bool
    message: str
    feedback: dict
