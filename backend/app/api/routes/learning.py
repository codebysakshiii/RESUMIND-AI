
from fastapi import APIRouter, Depends, HTTPException

from app.core.dependencies import get_current_user

from app.schemas.learning import (
    LearningRoadmapRequest,
    LearningGoalCreate,
    LearningGoalUpdate,
)

from app.services.learning_service import (
    create_learning_roadmap,
    get_learning_roadmap,
    create_learning_goal,
    get_learning_goals,
    update_learning_goal,
    update_roadmap_week,
)


router = APIRouter(
    tags=["AI Career Roadmap & Learning Tracker"]
)


# CREATE LEARNING ROADMAP
@router.post("/learning-roadmap/")
async def create_roadmap(
    request: LearningRoadmapRequest,
    current_user=Depends(get_current_user)
):
    try:
        return await create_learning_roadmap(
            current_user["_id"],
            request.model_dump()
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Roadmap creation failed: {str(e)}"
        )


# GET LEARNING ROADMAP
@router.get("/learning-roadmap/")
async def read_roadmap(
    current_user=Depends(get_current_user)
):
    try:
        return await get_learning_roadmap(
            current_user["_id"]
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Roadmap retrieval failed: {str(e)}"
        )


# CREATE DAILY LEARNING GOAL
@router.post("/learning-goals/")
async def create_goal(
    request: LearningGoalCreate,
    current_user=Depends(get_current_user)
):
    try:
        return await create_learning_goal(
            current_user["_id"],
            request.model_dump()
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Goal creation failed: {str(e)}"
        )


# GET ALL LEARNING GOALS
@router.get("/learning-goals/")
async def read_goals(
    current_user=Depends(get_current_user)
):
    try:
        return await get_learning_goals(
            current_user["_id"]
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Goal retrieval failed: {str(e)}"
        )


# UPDATE LEARNING GOAL
@router.put("/learning-goals/{goal_id}/")
async def edit_goal(
    goal_id: str,
    request: LearningGoalUpdate,
    current_user=Depends(get_current_user)
):
    try:
        result = await update_learning_goal(
            current_user["_id"],
            goal_id,
            request.model_dump(exclude_unset=True)
        )

        if result is None:
            raise HTTPException(
                status_code=404,
                detail="Learning goal not found or no valid updates provided"
            )

        return result

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Goal update failed: {str(e)}"
        )

    
@router.put("/learning-roadmap/weeks/{week_number}/")
async def update_week_progress(
    week_number: int,
    completed: bool,
    current_user: dict = Depends(get_current_user)
):
    if week_number < 1:
        raise HTTPException(
            status_code=400,
            detail="Week number must be greater than zero."
        )

    result = await update_roadmap_week(
        current_user["_id"],
        week_number,
        completed
    )

    if not result:
        raise HTTPException(
            status_code=404,
            detail="Learning roadmap or week not found."
        )

    return result

