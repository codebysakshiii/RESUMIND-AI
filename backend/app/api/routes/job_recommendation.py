
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException

from app.core.dependencies import get_current_user
from app.database.connection import database

from app.schemas.job_recommendation import (
    JobListingCreate,
    JobRecommendationRequest,
    ApplicationStatusUpdate,
    JobRecommendationResponse
)

from app.services.job_recommendation_service import recommend_jobs


router = APIRouter(
    prefix="/job-recommendations",
    tags=["AI Job & Internship Recommendations"]
)


@router.post("/listings")
async def create_job_listing(
    request: JobListingCreate,
    current_user=Depends(get_current_user)
):
    try:
        job_data = request.model_dump()

        job_data["created_by"] = current_user["_id"]
        job_data["created_at"] = __import__("datetime").datetime.now(
            __import__("datetime").timezone.utc
        )

        result = await database["job_listings"].insert_one(job_data)

        return {
            "success": True,
            "message": "Job listing created successfully!",
            "job_id": str(result.inserted_id)
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Job listing creation failed: {str(e)}"
        )


@router.post(
    "/",
    response_model=JobRecommendationResponse
)
async def get_job_recommendations(
    request: JobRecommendationRequest,
    current_user=Depends(get_current_user)
):
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

    jobs = await database["job_listings"].find({}).to_list(
        length=500
    )

    recommendations = recommend_jobs(
        resume=resume,
        jobs=jobs,
        target_role=request.target_role,
        job_type=request.job_type,
        location=request.location,
        work_mode=request.work_mode
    )

    return {
        "success": True,
        "message": "Job recommendations generated successfully!",
        "recommendations": recommendations
    }


@router.post("/{job_id}/apply")
async def update_application_status(
    job_id: str,
    request: ApplicationStatusUpdate,
    current_user=Depends(get_current_user)
):
    if not ObjectId.is_valid(job_id):
        raise HTTPException(
            status_code=400,
            detail="Invalid job ID"
        )

    job = await database["job_listings"].find_one({
        "_id": ObjectId(job_id)
    })

    if not job:
        raise HTTPException(
            status_code=404,
            detail="Job listing not found"
        )

    application_data = {
        "user_id": current_user["_id"],
        "job_id": ObjectId(job_id),
        "status": request.status
    }

    await database["job_applications"].update_one(
        {
            "user_id": current_user["_id"],
            "job_id": ObjectId(job_id)
        },
        {"$set": application_data},
        upsert=True
    )

    return {
        "success": True,
        "message": "Application status updated successfully!",
        "status": request.status
    }


@router.get("/applications")
async def get_my_applications(
    current_user=Depends(get_current_user)
):
    applications = await database["job_applications"].find({
        "user_id": current_user["_id"]
    }).to_list(length=500)

    results = []

    for application in applications:
        job = await database["job_listings"].find_one({
            "_id": application["job_id"]
        })

        if job:
            results.append({
                "job_id": str(job["_id"]),
                "title": job.get("title"),
                "company": job.get("company"),
                "location": job.get("location"),
                "job_type": job.get("job_type"),
                "status": application.get("status")
            })

    return {
        "success": True,
        "total_applications": len(results),
        "applications": results
    }
