
from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId

from app.core.dependencies import get_current_user
from app.database.connection import database
from app.services.analysis_service import analyze_resume_text

router = APIRouter(
    prefix="/analysis",
    tags=["AI Resume Analysis"]
)

resumes_collection = database["resumes"]
analyses_collection = database["analyses"]


@router.post("/{resume_id}")
async def analyze_uploaded_resume(
    resume_id: str,
    current_user: dict = Depends(get_current_user)
):
    if not ObjectId.is_valid(resume_id):
        raise HTTPException(
            status_code=400,
            detail="Invalid resume ID"
        )

    resume = await resumes_collection.find_one({
        "_id": ObjectId(resume_id),
        "user_id": current_user["_id"]
    })

    if not resume:
        raise HTTPException(
            status_code=404,
            detail="Resume not found"
        )

    try:
        result = analyze_resume_text(
            resume["extracted_text"]
        )
    except ValueError as error:
        raise HTTPException(
            status_code=422,
            detail=str(error)
        )

    analysis_document = {
        "user_id": current_user["_id"],
        "resume_id": ObjectId(resume_id),
        "analysis": result
    }

    saved_analysis = await analyses_collection.insert_one(
        analysis_document
    )

    return {
        "success": True,
        "message": "Resume analysis completed successfully!",
        "analysis_id": str(saved_analysis.inserted_id),
        "resume_id": resume_id,
        "result": result
    }
