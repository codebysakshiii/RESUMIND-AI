
from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId

from app.core.dependencies import get_current_user
from app.database.connection import database
from app.schemas.job_matching import (
    JobMatchRequest,
    JobMatchResponse
)
from app.services.job_matching_service import calculate_job_match


router = APIRouter(
    prefix="/job-matching",
    tags=["AI Job Matching"]
)

resumes_collection = database["resumes"]
matches_collection = database["job_matches"]


@router.post("/", response_model=JobMatchResponse)
async def match_resume_with_job(
    request: JobMatchRequest,
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
        result = calculate_job_match(
            resume_text=resume["extracted_text"],
            job_description=request.job_description
        )

    except ValueError as error:
        raise HTTPException(
            status_code=422,
            detail=str(error)
        )

    match_document = {
        "user_id": current_user["_id"],
        "resume_id": ObjectId(request.resume_id),
        "job_description": request.job_description,
        "result": result
    }

    saved_match = await matches_collection.insert_one(
        match_document
    )

    return {
        "success": True,
        "message": "Job matching completed successfully!",
        "match_id": str(saved_match.inserted_id),
        "resume_id": request.resume_id,
        "result": result
    }
