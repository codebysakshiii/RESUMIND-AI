
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException

from app.core.dependencies import get_current_user
from app.database.connection import database

from app.schemas.resume_comparison import (
    ResumeComparisonRequest,
    ResumeComparisonResponse,
)

from app.services.resume_comparison_service import (
    compare_resume_versions,
)


router = APIRouter(
    prefix="/resume-comparison",
    tags=["AI Resume Version Comparison"],
)

generated_resumes_collection = database["generated_resumes"]


@router.post(
    "/",
    response_model=ResumeComparisonResponse,
)
async def compare_saved_resume_versions(
    request: ResumeComparisonRequest,
    current_user: dict = Depends(get_current_user),
):
    if not ObjectId.is_valid(request.resume_id):
        raise HTTPException(
            status_code=400,
            detail="Invalid resume ID.",
        )

    if not ObjectId.is_valid(request.old_version_id):
        raise HTTPException(
            status_code=400,
            detail="Invalid old version ID.",
        )

    if not ObjectId.is_valid(request.new_version_id):
        raise HTTPException(
            status_code=400,
            detail="Invalid new version ID.",
        )

    if request.old_version_id == request.new_version_id:
        raise HTTPException(
            status_code=400,
            detail="Please select two different resume versions.",
        )

    query = {
        "user_id": current_user["_id"],
        "resume_id": ObjectId(request.resume_id),
    }

    old_version = await generated_resumes_collection.find_one({
        **query,
        "_id": ObjectId(request.old_version_id),
    })

    new_version = await generated_resumes_collection.find_one({
        **query,
        "_id": ObjectId(request.new_version_id),
    })

    if not old_version:
        raise HTTPException(
            status_code=404,
            detail="Old resume version not found.",
        )

    if not new_version:
        raise HTTPException(
            status_code=404,
            detail="New resume version not found.",
        )

    comparison = compare_resume_versions(
        old_result=old_version.get("result", {}),
        new_result=new_version.get("result", {}),
    )

    comparison["old_version"] = {
        "builder_id": str(old_version["_id"]),
        "version": old_version.get("version"),
        "target_role": old_version.get("target_role"),
        "template": old_version.get("template"),
    }

    comparison["new_version"] = {
        "builder_id": str(new_version["_id"]),
        "version": new_version.get("version"),
        "target_role": new_version.get("target_role"),
        "template": new_version.get("template"),
    }

    return {
        "success": True,
        "message": "Resume versions compared successfully!",
        "comparison": comparison,
    }
