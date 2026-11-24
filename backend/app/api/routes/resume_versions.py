from datetime import datetime, timezone

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException

from app.core.dependencies import get_current_user
from app.database.connection import database
from app.schemas.resume_version import (
    ResumeVersionItem,
    ResumeVersionListResponse,
)

router = APIRouter(
    prefix="/resume-versions",
    tags=["Resume Version Management"]
)

generated_resumes_collection = database["generated_resumes"]


@router.get(
    "/{resume_id}",
    response_model=ResumeVersionListResponse
)
async def get_resume_versions(
    resume_id: str,
    current_user: dict = Depends(get_current_user)
):
    if not ObjectId.is_valid(resume_id):
        raise HTTPException(
            status_code=400,
            detail="Invalid resume ID."
        )

    documents = await generated_resumes_collection.find({
        "resume_id": ObjectId(resume_id),
        "user_id": current_user["_id"]
    }).sort("_id", -1).to_list(length=100)

    if not documents:
        raise HTTPException(
            status_code=404,
            detail="No generated resume versions found."
        )

    versions = []

    for index, document in enumerate(documents):
        created_at = document.get("created_at")

        if isinstance(created_at, datetime):
            created_at = created_at.isoformat()
        elif created_at is None:
            created_at = document["_id"].generation_time.isoformat()
        else:
            created_at = str(created_at)

        versions.append(
            ResumeVersionItem(
                builder_id=str(document["_id"]),
                resume_id=str(document["resume_id"]),
                version=document.get("version", len(documents) - index),
                target_role=document.get("target_role"),
                template=document.get("template", "professional"),
                created_at=created_at
            )
        )

    return ResumeVersionListResponse(
        success=True,
        message="Resume versions retrieved successfully!",
        resume_id=resume_id,
        total_versions=len(versions),
        versions=versions
    )