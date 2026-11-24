from pydantic import BaseModel, Field


class ATSTrackerRequest(BaseModel):
    old_analysis_id: str = Field(..., min_length=1)
    new_analysis_id: str = Field(..., min_length=1)


class ATSTrackerResponse(BaseModel):
    success: bool
    message: str
    tracker_id: str
    old_analysis_id: str
    new_analysis_id: str
    result: dict