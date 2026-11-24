
from fastapi import APIRouter, Depends, HTTPException

from app.core.dependencies import get_current_user

from app.schemas.skill_progress import (
    SkillProgressCreate,
    SkillProgressUpdate
)

from app.services.skill_progress_service import (
    create_skill_progress,
    get_skill_progress,
    update_skill_progress
)


router = APIRouter(tags=["Skill Progress Tracking"])


@router.post("/skill-progress/")
async def create_skill(
    request: SkillProgressCreate,
    current_user: dict = Depends(get_current_user)
):
    result = await create_skill_progress(
        current_user["_id"],
        request.model_dump()
    )

    if not result:
        raise HTTPException(
            status_code=409,
            detail="This skill already exists in your progress tracker."
        )

    return result


@router.get("/skill-progress/")
async def get_skills(
    current_user: dict = Depends(get_current_user)
):
    return await get_skill_progress(current_user["_id"])


@router.put("/skill-progress/{skill_id}/")
async def update_skill(
    skill_id: str,
    request: SkillProgressUpdate,
    current_user: dict = Depends(get_current_user)
):
    result = await update_skill_progress(
        current_user["_id"],
        skill_id,
        request.model_dump()
    )

    if not result:
        raise HTTPException(
            status_code=404,
            detail="Skill not found or no valid updates provided."
        )

    return result
