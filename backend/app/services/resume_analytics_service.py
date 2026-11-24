
from app.database.connection import database


resumes_collection = database["resumes"]
analyses_collection = database["analyses"]
generated_resumes_collection = database["generated_resumes"]
job_matches_collection = database["job_matches"]
skill_gaps_collection = database["skill_gaps"]


async def get_resume_analytics(user_id):
    # 1. Count total resumes
    total_resumes = await resumes_collection.count_documents({
        "user_id": user_id
    })

    # 2. Fetch all analysis records
    analyses = await analyses_collection.find({
        "user_id": user_id
    }).sort("_id", 1).to_list(length=1000)

    scores = []
    score_history = []

    for document in analyses:
        analysis_result = document.get("analysis", {})
        ats_score = analysis_result.get("ats_score")

        if isinstance(ats_score, (int, float)):
            scores.append(float(ats_score))

            score_history.append({
                "analysis_id": str(document["_id"]),
                "ats_score": float(ats_score),
                "created_at": document["_id"].generation_time.isoformat()
            })

    # 3. Calculate ATS statistics
    total_analyses = len(analyses)

    if scores:
        average_ats_score = round(sum(scores) / len(scores), 2)
        highest_ats_score = max(scores)
        lowest_ats_score = min(scores)
    else:
        average_ats_score = 0.0
        highest_ats_score = 0.0
        lowest_ats_score = 0.0

    # 4. Count generated resume versions
    total_resume_versions = await generated_resumes_collection.count_documents({
        "user_id": user_id
    })

    # 5. Count job matches
    total_job_matches = await job_matches_collection.count_documents({
        "user_id": user_id
    })

    # 6. Count skill gap analyses
    total_skill_gap_analyses = await skill_gaps_collection.count_documents({
        "user_id": user_id
    })

    return {
        "success": True,
        "message": "Resume analytics retrieved successfully!",
        "total_resumes": total_resumes,
        "total_analyses": total_analyses,
        "average_ats_score": average_ats_score,
        "highest_ats_score": highest_ats_score,
        "lowest_ats_score": lowest_ats_score,
        "total_resume_versions": total_resume_versions,
        "total_job_matches": total_job_matches,
        "total_skill_gap_analyses": total_skill_gap_analyses,
        "score_history": score_history
    }
