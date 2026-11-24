
import re

from app.services.analysis_service import extract_skills


def normalize_text(text: str) -> str:
    """Normalize text for consistent skill matching."""
    return re.sub(r"\s+", " ", text.lower()).strip()


def calculate_job_match(resume_text: str, job_description: str) -> dict:
    """Compare resume skills with job description requirements."""

    if not resume_text or not resume_text.strip():
        raise ValueError("Resume text cannot be empty.")

    if not job_description or len(job_description.strip()) < 50:
        raise ValueError("Please provide a valid job description.")

    resume_skills = set(extract_skills(resume_text))
    job_skills = set(extract_skills(job_description))

    matched_skills = sorted(resume_skills.intersection(job_skills))
    missing_skills = sorted(job_skills - resume_skills)

    if job_skills:
        skill_match_score = round(
            (len(matched_skills) / len(job_skills)) * 100
        )
    else:
        skill_match_score = 0

    resume_words = set(normalize_text(resume_text).split())
    job_words = set(normalize_text(job_description).split())

    stop_words = {
        "the", "and", "for", "with", "this", "that", "are",
        "you", "your", "will", "have", "has", "from", "our",
        "their", "they", "who", "what", "when", "where",
        "a", "an", "to", "of", "in", "on", "is", "be",
        "as", "or", "by", "at"
    }

    relevant_job_words = job_words - stop_words
    matched_keywords = sorted(
        resume_words.intersection(relevant_job_words)
    )

    keyword_score = (
        round(
            (len(matched_keywords) / len(relevant_job_words)) * 100
        )
        if relevant_job_words else 0
    )

    # Weighted compatibility score
    overall_score = round(
        (skill_match_score * 0.80) +
        (keyword_score * 0.20)
    )

    suggestions = []

    if missing_skills:
        suggestions.append(
            "Consider learning relevant missing skills: "
            + ", ".join(missing_skills)
        )

    if skill_match_score < 50:
        suggestions.append(
            "Your resume has limited overlap with the technical skills "
            "mentioned in this job description."
        )

    if keyword_score < 40:
        suggestions.append(
            "Include relevant job-related keywords in your resume "
            "where they accurately describe your experience."
        )

    if not suggestions:
        suggestions.append(
            "Your resume shows good keyword and technical skill alignment "
            "with this job description."
        )

    return {
        "compatibility_score": overall_score,
        "score_type": "Heuristic job compatibility estimate",
        "skill_match_score": skill_match_score,
        "keyword_score": keyword_score,
        "resume_skills": sorted(resume_skills),
        "required_skills": sorted(job_skills),
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "matched_keywords": matched_keywords,
        "suggestions": suggestions,
        "note": (
            "This is an estimated compatibility score, not a guarantee "
            "of interview selection or an official ATS result."
        )
    }
