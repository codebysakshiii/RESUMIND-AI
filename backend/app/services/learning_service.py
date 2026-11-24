
from datetime import datetime, timezone
from bson import ObjectId

from app.database.connection import database


roadmaps_collection = database["learning_roadmaps"]
goals_collection = database["learning_goals"]


def utc_now():
    return datetime.now(timezone.utc)


async def create_learning_roadmap(user_id, roadmap_data):
    target_skills = roadmap_data.get("target_skills", [])
    duration_weeks = roadmap_data.get("duration_weeks", 8)

    weekly_plan = []

    total_skills = len(target_skills)
    base_skills = total_skills // duration_weeks
    extra_skills = total_skills % duration_weeks

    for week in range(1, duration_weeks + 1):
        start_index = (
            (week - 1) * base_skills
            + min(week - 1, extra_skills)
        )

        end_index = (
            start_index
            + base_skills
            + (1 if week <= extra_skills else 0)
        )

        week_skills = target_skills[start_index:end_index]

        weekly_plan.append({
            "week": week,
            "title": (
                f"Learn {', '.join(week_skills)}"
                if week_skills
                else "Practice and revise learned skills"
            ),
            "skills": week_skills,
            "completed": False
        })

    roadmap = {
        "user_id": user_id,
        "target_role": roadmap_data.get("target_role"),
        "current_skills": roadmap_data.get("current_skills", []),
        "target_skills": target_skills,
        "daily_study_hours": roadmap_data.get("daily_study_hours", 2),
        "duration_weeks": duration_weeks,
        "weekly_plan": weekly_plan,
        "created_at": utc_now(),
        "updated_at": utc_now()
    }

    result = await roadmaps_collection.insert_one(roadmap)

    roadmap["_id"] = str(result.inserted_id)
    roadmap["user_id"] = str(roadmap["user_id"])

    return {
        "success": True,
        "message": "Learning roadmap created successfully!",
        "roadmap": roadmap
    }


async def get_learning_roadmap(user_id):
    roadmap = await roadmaps_collection.find_one(
        {"user_id": user_id},
        sort=[("_id", -1)]
    )

    if not roadmap:
        return {
            "success": True,
            "message": "No learning roadmap found.",
            "roadmap": None
        }

    roadmap["_id"] = str(roadmap["_id"])
    roadmap["user_id"] = str(roadmap["user_id"])

    return {
        "success": True,
        "message": "Learning roadmap retrieved successfully!",
        "roadmap": roadmap
    }


async def create_learning_goal(user_id, goal_data):
    goal = {
        "user_id": user_id,
        "title": goal_data.get("title"),
        "description": goal_data.get("description"),
        "skill": goal_data.get("skill"),
        "due_date": goal_data.get("due_date").isoformat(),
        "completed": False,
        "created_at": utc_now(),
        "updated_at": utc_now()
    }

    result = await goals_collection.insert_one(goal)

    goal["_id"] = str(result.inserted_id)
    goal["user_id"] = str(goal["user_id"])

    return {
        "success": True,
        "message": "Learning goal created successfully!",
        "goal": goal
    }


async def get_learning_goals(user_id):
    goals = await goals_collection.find(
        {"user_id": user_id}
    ).sort("due_date", 1).to_list(length=1000)

    completed_goals = sum(
        1 for goal in goals if goal.get("completed", False)
    )

    for goal in goals:
        goal["_id"] = str(goal["_id"])
        goal["user_id"] = str(goal["user_id"])

    total_goals = len(goals)

    return {
        "success": True,
        "message": "Learning goals retrieved successfully!",
        "total_goals": total_goals,
        "completed_goals": completed_goals,
        "pending_goals": total_goals - completed_goals,
        "goals": goals
    }


async def update_learning_goal(user_id, goal_id, update_data):
    if not ObjectId.is_valid(goal_id):
        return None

    allowed_fields = {
        "title",
        "description",
        "skill",
        "due_date",
        "completed"
    }

    updates = {
        key: value
        for key, value in update_data.items()
        if key in allowed_fields and value is not None
    }

    if "due_date" in updates:
        updates["due_date"] = updates["due_date"].isoformat()

    if not updates:
        return None

    updates["updated_at"] = utc_now()

    result = await goals_collection.update_one(
        {"_id": ObjectId(goal_id), "user_id": user_id},
        {"$set": updates}
    )

    if result.matched_count == 0:
        return None

    updated_goal = await goals_collection.find_one({
        "_id": ObjectId(goal_id),
        "user_id": user_id
    })

    updated_goal["_id"] = str(updated_goal["_id"])
    updated_goal["user_id"] = str(updated_goal["user_id"])

    return {
        "success": True,
        "message": "Learning goal updated successfully!",
        "goal": updated_goal
    }


# UPDATE WEEKLY ROADMAP PROGRESS
async def update_roadmap_week(user_id, week_number, completed):
    roadmap = await roadmaps_collection.find_one(
        {"user_id": user_id},
        sort=[("_id", -1)]
    )

    if not roadmap:
        return None

    result = await roadmaps_collection.update_one(
        {
            "_id": roadmap["_id"],
            "user_id": user_id,
            "weekly_plan.week": week_number
        },
        {
            "$set": {
                "weekly_plan.$.completed": completed,
                "updated_at": utc_now()
            }
        }
    )

    if result.matched_count == 0:
        return None

    updated_roadmap = await roadmaps_collection.find_one({
        "_id": roadmap["_id"],
        "user_id": user_id
    })

    updated_roadmap["_id"] = str(updated_roadmap["_id"])
    updated_roadmap["user_id"] = str(updated_roadmap["user_id"])

    return {
        "success": True,
        "message": "Weekly roadmap progress updated successfully!",
        "roadmap": updated_roadmap
    }
