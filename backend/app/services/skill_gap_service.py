
from app.services.analysis_service import extract_skills


# Learning roadmap for commonly required technical skills
SKILL_ROADMAP = {
    "python": {
        "category": "Programming",
        "priority": "High",
        "level": "Beginner to Advanced",
        "topics": [
            "Python basics and syntax",
            "Functions and OOP",
            "File handling and exception handling",
            "Advanced Python concepts",
            "Practical Python projects"
        ]
    },
    "fastapi": {
        "category": "Backend Development",
        "priority": "High",
        "level": "Intermediate",
        "topics": [
            "FastAPI fundamentals",
            "API routes and HTTP methods",
            "Pydantic validation",
            "Authentication and JWT",
            "Database integration"
        ]
    },
    "flask": {
        "category": "Backend Development",
        "priority": "Medium",
        "level": "Intermediate",
        "topics": [
            "Flask fundamentals",
            "Routing and templates",
            "REST API development",
            "Database integration",
            "Deployment"
        ]
    },
    "mongodb": {
        "category": "Database",
        "priority": "High",
        "level": "Beginner to Intermediate",
        "topics": [
            "NoSQL database fundamentals",
            "Collections and documents",
            "CRUD operations",
            "MongoDB queries and indexing",
            "Python and MongoDB integration"
        ]
    },
    "react": {
        "category": "Frontend Development",
        "priority": "High",
        "level": "Intermediate",
        "topics": [
            "Components and JSX",
            "Props and state",
            "React Hooks",
            "React Router",
            "API integration and projects"
        ]
    },
    "javascript": {
        "category": "Programming",
        "priority": "High",
        "level": "Beginner to Advanced",
        "topics": [
            "JavaScript fundamentals",
            "DOM manipulation",
            "ES6+ concepts",
            "Promises and async/await",
            "API integration"
        ]
    },
    "sql": {
        "category": "Database",
        "priority": "High",
        "level": "Beginner to Advanced",
        "topics": [
            "SQL fundamentals",
            "SELECT and filtering",
            "Joins and subqueries",
            "Database design",
            "Advanced queries"
        ]
    },
    "git": {
        "category": "Developer Tools",
        "priority": "Medium",
        "level": "Beginner",
        "topics": [
            "Git fundamentals",
            "Commits and branches",
            "Merge and conflict resolution",
            "GitHub repositories",
            "Collaborative workflows"
        ]
    },
    "algorithms": {
        "category": "Computer Science",
        "priority": "High",
        "level": "Intermediate to Advanced",
        "topics": [
            "Searching algorithms",
            "Sorting algorithms",
            "Recursion",
            "Greedy and dynamic programming",
            "Algorithm complexity"
        ]
    },
    "data structures": {
        "category": "Computer Science",
        "priority": "High",
        "level": "Beginner to Advanced",
        "topics": [
            "Arrays and strings",
            "Linked lists",
            "Stacks and queues",
            "Trees and graphs",
            "Hashing and problem solving"
        ]
    },
    "rest api": {
        "category": "Backend Development",
        "priority": "High",
        "level": "Intermediate",
        "topics": [
            "HTTP methods and status codes",
            "REST architecture",
            "Request and response handling",
            "API authentication",
            "API testing"
        ]
    }
}


def analyze_skill_gaps(
    resume_text: str,
    job_description: str
) -> dict:
    """Identify skill gaps and generate a learning roadmap."""

    if not resume_text or not resume_text.strip():
        raise ValueError("Resume text cannot be empty.")

    if not job_description or len(job_description.strip()) < 50:
        raise ValueError("Please provide a valid job description.")

    resume_skills = set(extract_skills(resume_text))
    required_skills = set(extract_skills(job_description))

    matched_skills = sorted(resume_skills & required_skills)
    missing_skills = sorted(required_skills - resume_skills)

    high_priority = []
    medium_priority = []
    low_priority = []
    learning_roadmap = []

    for skill in missing_skills:
        roadmap = SKILL_ROADMAP.get(skill)

        if roadmap:
            priority = roadmap["priority"]

            skill_item = {
                "skill": skill,
                "category": roadmap["category"],
                "priority": priority,
                "level": roadmap["level"],
                "learning_topics": roadmap["topics"]
            }

            learning_roadmap.append(skill_item)

            if priority == "High":
                high_priority.append(skill)
            elif priority == "Medium":
                medium_priority.append(skill)
            else:
                low_priority.append(skill)

        else:
            medium_priority.append(skill)

            learning_roadmap.append({
                "skill": skill,
                "category": "Technical Skill",
                "priority": "Medium",
                "level": "To be assessed",
                "learning_topics": [
                    f"Understand the fundamentals of {skill}",
                    f"Practice {skill} with hands-on exercises",
                    f"Build a practical project using {skill}"
                ]
            })

    total_required = len(required_skills)
    total_missing = len(missing_skills)

    gap_percentage = (
        round((total_missing / total_required) * 100)
        if total_required else 0
    )

    return {
        "total_required_skills": total_required,
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "total_matched_skills": len(matched_skills),
        "total_missing_skills": total_missing,
        "skill_gap_percentage": gap_percentage,
        "priority_breakdown": {
            "high": high_priority,
            "medium": medium_priority,
            "low": low_priority
        },
        "learning_roadmap": learning_roadmap,
        "note": (
            "Skills are identified from resume text and job description. "
            "Missing skills indicate that they were not detected in the "
            "resume, not that the candidate definitely lacks them."
        )
    }
