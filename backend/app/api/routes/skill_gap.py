
from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId

from app.core.dependencies import get_current_user
from app.database.connection import database
from app.schemas.skill_gap import (
    SkillGapRequest,
    SkillGapResponse
)
from app.services.skill_gap_service import analyze_skill_gaps


router = APIRouter(
    prefix="/skill-gap",
    tags=["Skill Gap Intelligence"]
)

resumes_collection = database["resumes"]
skill_gaps_collection = database["skill_gaps"]


@router.post("/", response_model=SkillGapResponse)
async def analyze_resume_skill_gaps(
    request: SkillGapRequest,
    current_user: dict = Depends(get_current_user)
):
    if not ObjectId.is_valid(request.resume_id):
        raise HTTPException(
            status_code=400,
            detail="Invalid resume ID."
        )

    resume = await resumes_collection.find_one({
        "_id": ObjectId(request.resume_id),
        "user_id": current_user["_id"]
    })

    if not resume:
        raise HTTPException(
            status_code=404,
            detail="Resume not found."
        )

    try:
        result = analyze_skill_gaps(
            resume_text=resume["extracted_text"],
            job_description=request.job_description
        )

    except ValueError as error:
        raise HTTPException(
            status_code=422,
            detail=str(error)
        )

    skill_gap_document = {
        "user_id": current_user["_id"],
        "resume_id": ObjectId(request.resume_id),
        "job_description": request.job_description,
        "result": result
    }

    saved_result = await skill_gaps_collection.insert_one(
        skill_gap_document
    )

    return {
        "success": True,
        "message": "Skill gap analysis completed successfully!",
        "skill_gap_id": str(saved_result.inserted_id),
        "resume_id": request.resume_id,
        "result": result
    }
