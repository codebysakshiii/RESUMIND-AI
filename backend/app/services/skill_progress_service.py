
from datetime import datetime, timezone
from bson import ObjectId

from app.database.connection import database


skill_progress_collection = database["skill_progress"]


def utc_now():
    return datetime.now(timezone.utc)


async def create_skill_progress(user_id, skill_data):
    skill_name = skill_data.get("skill_name", "").strip()

    existing_skill = await skill_progress_collection.find_one({
        "user_id": user_id,
        "skill_name": skill_name
    })

    if existing_skill:
        return None

    progress = skill_data.get("progress", 0)

    skill = {
        "user_id": user_id,
        "skill_name": skill_name,
        "progress": progress,
        "completed": progress == 100,
        "created_at": utc_now(),
        "updated_at": utc_now()
    }

    result = await skill_progress_collection.insert_one(skill)

    skill["_id"] = str(result.inserted_id)
    skill["user_id"] = str(skill["user_id"])

    return {
        "success": True,
        "message": "Skill progress created successfully!",
        "skill": skill
    }


async def get_skill_progress(user_id):
    skills = await skill_progress_collection.find(
        {"user_id": user_id}
    ).sort("created_at", 1).to_list(length=1000)

    for skill in skills:
        skill["_id"] = str(skill["_id"])
        skill["user_id"] = str(skill["user_id"])

    total_skills = len(skills)

    completed_skills = sum(
        1 for skill in skills if skill.get("completed", False)
    )

    average_progress = (
        round(
            sum(skill.get("progress", 0) for skill in skills)
            / total_skills
        )
        if total_skills else 0
    )

    return {
        "success": True,
        "message": "Skill progress retrieved successfully!",
        "total_skills": total_skills,
        "completed_skills": completed_skills,
        "average_progress": average_progress,
        "skills": skills
    }


async def update_skill_progress(user_id, skill_id, update_data):
    if not ObjectId.is_valid(skill_id):
        return None

    updates = {}

    if update_data.get("progress") is not None:
        updates["progress"] = update_data["progress"]
        updates["completed"] = update_data["progress"] == 100

    if update_data.get("completed") is not None:
        updates["completed"] = update_data["completed"]

        if update_data["completed"]:
            updates["progress"] = 100

    if not updates:
        return None

    updates["updated_at"] = utc_now()

    result = await skill_progress_collection.update_one(
        {
            "_id": ObjectId(skill_id),
            "user_id": user_id
        },
        {"$set": updates}
    )

    if result.matched_count == 0:
        return None

    updated_skill = await skill_progress_collection.find_one({
        "_id": ObjectId(skill_id),
        "user_id": user_id
    })

    updated_skill["_id"] = str(updated_skill["_id"])
    updated_skill["user_id"] = str(updated_skill["user_id"])

    return {
        "success": True,
        "message": "Skill progress updated successfully!",
        "skill": updated_skill
    }
