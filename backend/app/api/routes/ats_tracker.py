
from datetime import datetime, timezone

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException

from app.core.dependencies import get_current_user
from app.database.connection import database
from app.schemas.ats_tracker import (
    ATSTrackerRequest,
    ATSTrackerResponse
)
from app.services.ats_tracker_service import compare_ats_scores


router = APIRouter(
    prefix="/ats-tracker",
    tags=["ATS Score Improvement Tracker"]
)

analyses_collection = database["analyses"]
ats_trackers_collection = database["ats_trackers"]


@router.post("/", response_model=ATSTrackerResponse)
async def track_ats_improvement(
    request: ATSTrackerRequest,
    current_user: dict = Depends(get_current_user)
):
    if not ObjectId.is_valid(request.old_analysis_id):
        raise HTTPException(
            status_code=400,
            detail="Invalid old analysis ID."
        )

    if not ObjectId.is_valid(request.new_analysis_id):
        raise HTTPException(
            status_code=400,
            detail="Invalid new analysis ID."
        )

    if request.old_analysis_id == request.new_analysis_id:
        raise HTTPException(
            status_code=400,
            detail="Please provide two different analysis IDs."
        )

    old_analysis = await analyses_collection.find_one({
        "_id": ObjectId(request.old_analysis_id),
        "user_id": current_user["_id"]
    })

    new_analysis = await analyses_collection.find_one({
        "_id": ObjectId(request.new_analysis_id),
        "user_id": current_user["_id"]
    })

    if not old_analysis or not new_analysis:
        raise HTTPException(
            status_code=404,
            detail="One or both analysis records were not found."
        )

    old_result = old_analysis.get("analysis", {})
    new_result = new_analysis.get("analysis", {})

    old_score = old_result.get("ats_score")
    new_score = new_result.get("ats_score")

    if old_score is None or new_score is None:
        raise HTTPException(
            status_code=422,
            detail="ATS score is missing from one or both analysis records."
        )

    result = compare_ats_scores(
        old_score=float(old_score),
        new_score=float(new_score)
    )

    tracker_document = {
        "user_id": current_user["_id"],
        "old_analysis_id": ObjectId(request.old_analysis_id),
        "new_analysis_id": ObjectId(request.new_analysis_id),
        "result": result,
        "created_at": datetime.now(timezone.utc)
    }

    saved_tracker = await ats_trackers_collection.insert_one(
        tracker_document
    )

    return {
        "success": True,
        "message": "ATS score comparison completed successfully!",
        "tracker_id": str(saved_tracker.inserted_id),
        "old_analysis_id": request.old_analysis_id,
        "new_analysis_id": request.new_analysis_id,
        "result": result
    }
