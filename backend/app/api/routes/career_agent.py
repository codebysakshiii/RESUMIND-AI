
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException
from app.core.dependencies import get_current_user
from app.database.connection import database

from app.schemas.career_agent import (
    CareerPlanRequest,
    CareerPlanResponse
)

from app.services.career_agent_service import (
    generate_career_plan
)


router = APIRouter(
    prefix="/career-agent",
    tags=["Personal AI Career Agent"]
)


@router.post("/", response_model=CareerPlanResponse)
async def create_career_plan(
    request: CareerPlanRequest,
    current_user=Depends(get_current_user)
):
    try:
        if not ObjectId.is_valid(request.resume_id):
            raise HTTPException(
                status_code=400,
                detail="Invalid resume ID"
            )

        resume = await database["resumes"].find_one({
            "_id": ObjectId(request.resume_id),
            "user_id": current_user["_id"]
        })

        if not resume:
            raise HTTPException(
                status_code=404,
                detail="Resume not found"
            )

        if request.experience_level not in [
            "fresher",
            "beginner",
            "intermediate",
            "experienced"
        ]:
            raise HTTPException(
                status_code=400,
                detail="Invalid experience level"
            )

        plan = generate_career_plan(
            resume=resume,
            target_role=request.target_role,
            weekly_hours=request.weekly_hours,
            experience_level=request.experience_level
        )

        return {
            "success": True,
            "message": "Career plan generated successfully!",
            "plan": plan
        }

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Career plan generation failed: {str(e)}"
        )
