
from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId
from datetime import datetime, timezone

from app.core.dependencies import get_current_user
from app.database.connection import database
from app.schemas.resume_builder import (
    ResumeBuilderRequest,
    ResumeBuilderResponse
)
from app.services.resume_builder_service import build_resume


router = APIRouter(
    prefix="/resume-builder",
    tags=["AI Resume Builder"]
)

resumes_collection = database["resumes"]
analyses_collection = database["analyses"]
generated_resumes_collection = database["generated_resumes"]


@router.post("/", response_model=ResumeBuilderResponse)
async def generate_resume(
    request: ResumeBuilderRequest,
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

    analysis_document = await analyses_collection.find_one(
        {
            "user_id": current_user["_id"],
            "resume_id": ObjectId(request.resume_id)
        },
        sort=[("_id", -1)]
    )

    if not analysis_document:
        raise HTTPException(
            status_code=404,
            detail="Please analyze your resume before generating a new resume."
        )

    analysis_result = analysis_document.get("analysis", {})

    try:
        result = build_resume(
            resume_text=resume.get("extracted_text", ""),
            analysis_result=analysis_result,
            target_role=request.target_role,
            template=request.template
        )
    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Resume generation failed: {str(error)}"
        )

    existing_versions = await generated_resumes_collection.count_documents({
        "user_id": current_user["_id"],
        "resume_id": ObjectId(request.resume_id)
    })

    next_version = existing_versions + 1

    generated_document = {
        "user_id": current_user["_id"],
        "resume_id": ObjectId(request.resume_id),
        "target_role": request.target_role,
        "template": request.template,
        "version": next_version,
        "created_at": datetime.now(timezone.utc),
        "result": result
    }

    saved_result = await generated_resumes_collection.insert_one(
        generated_document
    )

    return {
        "success": True,
        "message": "Resume generated successfully!",
        "builder_id": str(saved_result.inserted_id),
        "resume_id": request.resume_id,
        "result": result
    }
