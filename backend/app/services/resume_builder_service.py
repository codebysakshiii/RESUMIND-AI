
from typing import Optional


def build_resume(
    resume_text: str,
    analysis_result: dict,
    target_role: Optional[str] = None,
    template: str = "professional"
) -> dict:
    """
    Build a structured resume using existing resume analysis data.
    Does not invent candidate information or achievements.
    """

    candidate = analysis_result.get("candidate", {})
    skills = analysis_result.get("skills", [])
    education = analysis_result.get("education", [])
    projects = analysis_result.get("projects", [])
    experience = analysis_result.get("experience", [])
    certifications = analysis_result.get("certifications", [])

    # Normalize section data
    if isinstance(skills, str):
        skills = [skills]

    if isinstance(education, str):
        education = [education]

    if isinstance(projects, str):
        projects = [projects]

    if isinstance(experience, str):
        experience = [experience]

    if isinstance(certifications, str):
        certifications = [certifications]

    # Professional summary
    summary = analysis_result.get("summary_improvement", "")

    if isinstance(summary, dict):
        summary = (
            summary.get("improved_summary")
            or summary.get("suggestion")
            or ""
        )

    if not isinstance(summary, str):
        summary = ""

    if not summary.strip():

        skill_names = [
            str(skill).strip()
            for skill in skills
            if str(skill).strip()
        ]

        project_names = [
            project.get("title", "")
            for project in projects
            if isinstance(project, dict) and project.get("title")
        ]

        role_text = (
            f"seeking opportunities as a {target_role}"
            if target_role
            else "seeking opportunities in software development"
        )

        summary_parts = [
            "Computer Science and Engineering student"
        ]

        if skill_names:
            summary_parts.append(
                "with technical knowledge of "
                + ", ".join(skill_names[:6])
            )

        if project_names:
            summary_parts.append(
                "with hands-on project experience in "
                + ", ".join(project_names[:3])
            )

        summary = " ".join(summary_parts) + f", {role_text}."

    else:
        summary = summary.strip()

    # Format projects
    formatted_projects = []

    for project in projects:
        if isinstance(project, dict):
            formatted_projects.append({
                "title": project.get("title", ""),
                "description": project.get("description", ""),
                "technologies": project.get("technologies", []),
                "category": project.get("category", "")
            })
        else:
            formatted_projects.append({
                "title": str(project),
                "description": "",
                "technologies": [],
                "category": ""
            })

    # Final resume
    resume = {
        "personal_information": {
            "name": candidate.get("name", ""),
            "email": candidate.get("email", ""),
            "phone": candidate.get("phone", "")
        },
        "professional_summary": summary,
        "target_role": target_role or "",
        "technical_skills": skills,
        "education": education,
        "projects": formatted_projects,
        "experience": experience,
        "certifications": certifications,
        "template": template
    }

    return {
        "resume": resume,
        "sections_completed": sum([
            bool(resume["personal_information"]["name"]),
            bool(resume["personal_information"]["email"]),
            bool(resume["technical_skills"]),
            bool(resume["education"]),
            bool(resume["projects"]),
            bool(resume["experience"]),
            bool(resume["certifications"])
        ]),
        "total_sections": 7,
        "generation_type": "Structured resume generation",
        "note": (
            "Resume generated using existing extracted resume data "
            "and analysis results. No unverified achievements or "
            "information have been added."
        )
    }
