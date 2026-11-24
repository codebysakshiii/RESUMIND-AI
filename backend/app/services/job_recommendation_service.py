
import re


def extract_skills(text):
    text = text.lower()

    skill_keywords = [
        "python",
        "java",
        "c++",
        "javascript",
        "react",
        "node.js",
        "html",
        "css",
        "sql",
        "mongodb",
        "mysql",
        "fastapi",
        "django",
        "flask",
        "machine learning",
        "data science",
        "data structures",
        "algorithms",
        "git",
        "github",
        "computer vision",
        "pandas",
        "numpy",
        "excel",
        "power bi",
        "communication",
        "rest api",
        "tailwind"
    ]

    found_skills = []

    for skill in skill_keywords:
        pattern = r"(?<![a-z0-9+#])" + re.escape(skill) + r"(?![a-z0-9+#])"

        if re.search(pattern, text):
            found_skills.append(skill)

    return found_skills


def calculate_match(resume_text, job_description):
    resume_skills = extract_skills(resume_text)
    job_skills = extract_skills(job_description)

    if not job_skills:
        return {
            "match_score": 0,
            "matched_skills": [],
            "missing_skills": [],
            "match_percentage": 0
        }

    matched = [
        skill for skill in job_skills
        if skill in resume_skills
    ]

    missing = [
        skill for skill in job_skills
        if skill not in resume_skills
    ]

    score = round(
        (len(matched) / len(job_skills)) * 100
    )

    return {
        "match_score": score,
        "matched_skills": matched,
        "missing_skills": missing,
        "match_percentage": score
    }


def recommend_jobs(
    resume,
    jobs,
    target_role,
    job_type="both",
    location=None,
    work_mode="any"
):
    resume_text = resume.get("extracted_text", "")

    recommendations = []

    for job in jobs:
        if job_type != "both" and job.get("job_type") != job_type:
            continue

        if location:
            job_location = job.get("location", "").lower()

            if location.lower() not in job_location:
                continue

        if work_mode != "any" and job.get("work_mode") != work_mode:
            continue

        job_description = (
            job.get("title", "")
            + " "
            + job.get("description", "")
        )

        result = calculate_match(
            resume_text,
            job_description
        )

        recommendations.append({
            "job_id": str(job["_id"]),
            "title": job.get("title"),
            "company": job.get("company"),
            "description": job.get("description"),
            "job_type": job.get("job_type"),
            "location": job.get("location"),
            "work_mode": job.get("work_mode"),
            "experience_level": job.get("experience_level"),
            "apply_url": job.get("apply_url"),
            **result
        })

    recommendations.sort(
        key=lambda item: item["match_score"],
        reverse=True
    )

    return recommendations
