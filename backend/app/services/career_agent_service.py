
def generate_career_plan(
    resume,
    target_role,
    weekly_hours=10,
    experience_level="fresher"
):
    """
    Generate a personalized career development plan.
    """

    resume_text = resume.get("extracted_text", "").lower()

    skill_keywords = {
        "Python Programming": ["python"],
        "Data Structures and Algorithms": [
            "data structures", "algorithms", "dsa"
        ],
        "Object-Oriented Programming": [
            "object-oriented", "oops", "oop"
        ],
        "FastAPI or Django": ["fastapi", "django"],
        "MongoDB and SQL": ["mongodb", "mongo db", "sql", "mysql"],
        "REST API Development": ["rest api", "restful api"],
        "Git and GitHub": ["git", "github"],
        "Build Real-World Projects": ["project", "projects"],
        "HTML and CSS": ["html", "css"],
        "JavaScript": ["javascript"],
        "React.js": ["react", "react.js"],
        "Node.js": ["node.js", "nodejs"],
        "Express.js": ["express.js", "express"],
        "Responsive Web Design": ["responsive design"],
        "API Integration": ["api integration"],
        "Excel": ["excel"],
        "Statistics": ["statistics"],
        "Power BI": ["power bi"],
        "Data Visualization": ["data visualization"]
    }

    skills = []

    for skill, keywords in skill_keywords.items():
        if any(keyword in resume_text for keyword in keywords):
            skills.append(skill)

    role = target_role.lower()

    career_roadmaps = {
        "python": [
            "Python Programming",
            "Data Structures and Algorithms",
            "Object-Oriented Programming",
            "FastAPI or Django",
            "MongoDB and SQL",
            "REST API Development",
            "Git and GitHub",
            "Build Real-World Projects"
        ],
        "frontend": [
            "HTML and CSS",
            "JavaScript",
            "Responsive Web Design",
            "React.js",
            "API Integration",
            "Git and GitHub",
            "Build Real-World Projects"
        ],
        "full stack": [
            "HTML and CSS",
            "JavaScript",
            "React.js",
            "Node.js",
            "Express.js",
            "MongoDB and SQL",
            "REST API Development",
            "Build Real-World Projects"
        ],
        "data analyst": [
            "Python Programming",
            "MongoDB and SQL",
            "Excel",
            "Statistics",
            "Power BI",
            "Data Visualization",
            "Build Real-World Projects"
        ]
    }

    matched_role = next(
        (
            key for key in career_roadmaps
            if key in role
        ),
        "python"
    )

    selected_roadmap = career_roadmaps[matched_role]

    missing_skills = [
        skill for skill in selected_roadmap
        if skill not in skills
    ]

    total_weeks = max(
        4,
        min(24, len(missing_skills) * 2)
    )

    weekly_plan = []

    for index, skill in enumerate(missing_skills):
        weekly_plan.append({
            "week": index + 1,
            "focus_skill": skill,
            "activities": [
                f"Learn {skill} fundamentals",
                f"Practice {skill} with coding exercises",
                f"Build a small project using {skill}"
            ]
        })

    projects = [
        f"Build a beginner-level {target_role} project",
        f"Build an intermediate {target_role} project",
        f"Create a portfolio project demonstrating your skills"
    ]

    return {
        "target_role": target_role,
        "experience_level": experience_level,
        "current_skills": skills,
        "recommended_skills": selected_roadmap,
        "missing_skills": missing_skills,
        "total_missing_skills": len(missing_skills),
        "estimated_duration_weeks": total_weeks,
        "weekly_hours": weekly_hours,
        "weekly_plan": weekly_plan,
        "recommended_projects": projects,
        "career_advice": [
            "Practice Data Structures and Algorithms regularly.",
            "Build practical projects for your portfolio.",
            "Maintain your GitHub profile.",
            "Prepare for technical and HR interviews.",
            "Improve communication skills."
        ],
        "generation_type": "Rule-based career planning",
        "note": "This is an estimated learning roadmap, not a guaranteed job placement plan."
    }
