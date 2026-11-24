
from fastapi import APIRouter, Depends

from app.core.dependencies import get_current_user
from app.schemas.resume_analytics import ResumeAnalyticsResponse
from app.services.resume_analytics_service import get_resume_analytics


router = APIRouter(
    prefix="/resume-analytics",
    tags=["Resume Analytics Dashboard"]
)


@router.get("/", response_model=ResumeAnalyticsResponse)
async def get_user_resume_analytics(
    current_user: dict = Depends(get_current_user)
):
    result = await get_resume_analytics(
        current_user["_id"]
    )

    return result
