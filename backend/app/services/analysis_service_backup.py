
import re


SKILL_KEYWORDS = [
    "python", "java", "c++", "javascript", "typescript",
    "html", "css", "react", "node.js", "express",
    "fastapi", "flask", "django", "mongodb", "mysql",
    "sql", "postgresql", "git", "github", "tailwind",
    "bootstrap", "machine learning", "deep learning",
    "artificial intelligence", "computer vision",
    "opencv", "tensorflow", "pytorch", "numpy",
    "pandas", "data structures", "algorithms",
    "rest api", "three.js", "vite"
]

# Recognized resume section headings
SECTION_HEADINGS = {
    "summary": ["summary", "profile", "professional summary",
                "career objective", "objective"],
    "skills": ["skills", "technical skills", "tech stack",
               "technical skills and tools"],
       "education": [
        "education",
        "academic qualification",
        "educational qualification"
    ],
    "projects": [
        "projects",
        "personal projects",
        "academic projects",
        "project experience",
        "featured projects",
        "selected projects",
        "project portfolio"
    ],
    
    "experience": ["experience", "work experience",
                   "professional experience", "internships",
                   "internship experience"],
    "certifications": ["certifications", "certificates"],
    "achievements": ["achievements", "accomplishments"],
    "target_roles": ["target roles", "career interests"],
    "links": ["links", "social links"]
}


def normalize_heading(line: str):
    line = line.lower().strip()
    line = re.sub(r"[\d\s.:#•|_-]+$", "", line)
    return line.strip()


def extract_sections(text: str):
    sections = {}
    current_section = None

    for line in text.splitlines():
        cleaned = line.strip()

        if not cleaned:
            continue

        normalized = normalize_heading(cleaned)
        matched_section = None

        for section, headings in SECTION_HEADINGS.items():
            if normalized in headings:
                matched_section = section
                break

        if matched_section:
            current_section = matched_section
            sections.setdefault(current_section, [])
            continue

        if current_section:
            sections[current_section].append(cleaned)

    return sections


def extract_email(text: str):
    match = re.search(
        r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b",
        text
    )
    return match.group(0) if match else None


def extract_phone(text: str):
    match = re.search(
        r"(?<!\d)(?:\+91[\s-]?)?[6-9]\d{9}(?!\d)",
        text
    )
    return match.group(0) if match else None


def extract_name(text: str):
    lines = [line.strip() for line in text.splitlines() if line.strip()]

    for line in lines[:8]:
        cleaned = re.sub(r"[^A-Za-z ]", " ", line)
        cleaned = " ".join(cleaned.split())

        excluded = [
            "resume", "profile", "frontend", "backend",
            "development", "computer", "engineering",
            "internship", "developer", "student"
        ]

        if (
            2 <= len(cleaned.split()) <= 3
            and len(cleaned) >= 4
            and not any(word in cleaned.lower() for word in excluded)
        ):
            return cleaned.title()

    return None


def extract_skills(text: str):
    text_lower = text.lower()
    found_skills = []

    for skill in SKILL_KEYWORDS:
        pattern = (
            r"(?<![a-z0-9])"
            + re.escape(skill)
            + r"(?![a-z0-9])"
        )

        if re.search(pattern, text_lower):
            found_skills.append(skill)

    # C is detected only when explicitly described as a programming skill
    if re.search(r"\b(c programming|programming in c|language:\s*c)\b",
                 text_lower):
        found_skills.append("c")

    return sorted(set(found_skills))


def extract_projects(project_lines: list):
    projects = []
    current_project = []

    for line in project_lines:
        cleaned = line.strip()

        if re.fullmatch(r"\d{1,2}", cleaned):
            if current_project:
                projects.append(current_project)
            current_project = []

        elif cleaned:
            current_project.append(cleaned)

    if current_project:
        projects.append(current_project)

    structured_projects = []

    for project in projects:
        if not project:
            continue

        title = project[0]
        category = project[1] if len(project) > 1 else None

        technologies = []
        description_parts = []

        for line in project[2:]:

            # Handle bullet, question mark and other separators
            parts = [
                item.strip()
                for item in re.split(r"[•·?|,/;]+", line)
                if item.strip()
            ]

            known_technologies = [
                skill.lower() for skill in SKILL_KEYWORDS
            ] + ["mediapipe", "gsap", "aos"]

            is_technology_line = (
                len(parts) >= 2
                and any(
                    part.lower() in known_technologies
                    for part in parts
                )
            )

            if is_technology_line and not technologies:
                technologies = parts
            else:
                description_parts.append(line)

        structured_projects.append({
            "title": title,
            "category": category,
            "technologies": technologies,
            "description": " ".join(description_parts).strip()
        })

    return structured_projects




def analyze_section_quality(text: str, sections: dict, skills: list, projects: list):
    quality = {}
    recommendations = []

    # 1. Professional Summary
    summary_lines = sections.get("summary", [])
    summary_text = " ".join(summary_lines)
    summary_words = len(summary_text.split())

    summary_score = 0

    if summary_words >= 30:
        summary_score += 50
    elif summary_words >= 15:
        summary_score += 30
    else:
        recommendations.append(
            "Expand your professional summary with your skills, interests and career goals."
        )

    if re.search(
        r"\b(developed|built|created|designed|experienced|skilled|interested)\b",
        summary_text.lower()
    ):
        summary_score += 25
    else:
        recommendations.append(
            "Use action-oriented language in your professional summary."
        )

    if summary_words <= 100 and summary_words >= 15:
        summary_score += 25
    elif summary_words > 100:
        recommendations.append(
            "Keep your professional summary concise and focused."
        )

    quality["summary"] = min(summary_score, 100)

    # 2. Skills
    skills_score = 0

    if len(skills) >= 8:
        skills_score = 100
    elif len(skills) >= 5:
        skills_score = 75
    elif len(skills) >= 3:
        skills_score = 50
    else:
        recommendations.append(
            "Add more relevant technical skills to your resume."
        )

    quality["skills"] = skills_score

    # 3. Education
    education_lines = sections.get("education", [])
    education_text = " ".join(education_lines).lower()

    education_score = 0

    if education_lines:
        education_score = 50

        if re.search(r"\b(b\.?tech|bachelor|degree|diploma|b\.?e\.?)\b", education_text):
            education_score += 25

        if re.search(r"\b(university|college|institute|rgpv)\b", education_text):
            education_score += 25
    else:
        recommendations.append(
            "Add your degree, college and university details."
        )

    quality["education"] = min(education_score, 100)

    # 4. Projects
    project_score = 0

    if projects:
        project_score = min(len(projects) * 15, 60)

        detailed_projects = sum(
            1 for project in projects
            if project.get("description")
            and len(project.get("technologies", [])) >= 2
        )

        project_score += min(detailed_projects * 10, 40)

        if detailed_projects < len(projects):
            recommendations.append(
                "Add technologies and clear descriptions to every project."
            )
    else:
        recommendations.append(
            "Add practical projects with technologies and descriptions."
        )

    quality["projects"] = min(project_score, 100)

    return {
        "section_quality": quality,
        "recommendations": recommendations
    }


def calculate_ats_score(text: str, skills: list, sections: dict):
    text_lower = text.lower()

    checks = {
        "contact_information": (
            bool(extract_email(text)) and bool(extract_phone(text))
        ),
        "education": bool(sections.get("education")),
        "skills": len(skills) >= 3,
       "projects": len(sections.get("projects", [])) >= 2,
        "experience": bool(sections.get("experience")),
        "summary": bool(sections.get("summary"))
    }

    weights = {
        "contact_information": 15,
        "education": 15,
        "skills": 20,
        "projects": 20,
        "experience": 15,
        "summary": 10
    }

    score = sum(
        weight
        for section, weight in weights.items()
        if checks[section]
    )

    # Additional quality signals
    if re.search(r"\b\d+%|\b\d+\+|\b\d+\s+(users|projects|clients)\b",
                 text_lower):
        score += 5

    if re.search(r"\b(achieved|developed|built|implemented|improved)\b",
                 text_lower):
        score += 5

    return min(score, 100), checks



def analyze_resume_text(text: str):
    if not text or not text.strip():
        raise ValueError("Resume text cannot be empty.")

    sections = extract_sections(text)

    name = extract_name(text)
    email = extract_email(text)
    phone = extract_phone(text)
    skills = extract_skills(text)

    education = sections.get("education", [])

    project_lines = sections.get("projects", [])
    projects = extract_projects(project_lines)

    experience = sections.get("experience", [])
    certifications = sections.get("certifications", [])

    ats_score, section_checks = calculate_ats_score(
        text, skills, sections
    )
    quality_result = analyze_section_quality(
    text, sections, skills, projects
    )

    strengths = []
    improvements = []

    if email and phone:
        strengths.append("Email and phone number are available.")
    else:
        improvements.append("Add a valid email address and phone number.")

    if len(skills) >= 5:
        strengths.append("Good range of technical skills identified.")
    else:
        improvements.append("Add more relevant technical skills.")

    if education:
        strengths.append("Education section contains information.")
    else:
        improvements.append("Add a clearly labelled education section.")

    if projects:
        strengths.append("Projects section contains information.")
    else:
        improvements.append("Add practical projects with technologies used.")

    if experience:
        strengths.append("Experience or internship section is present.")
    else:
        improvements.append(
            "Add relevant experience or internships, if available. "
            "Freshers can highlight projects instead."
        )

    if sections.get("summary"):
        strengths.append("Professional summary is present.")
    else:
        improvements.append("Add a short professional summary.")

    if not certifications:
        improvements.append(
            "Add relevant certifications if you have completed any."
        )



    return {
        "candidate": {
            "name": name,
            "email": email,
            "phone": phone
        },
        "skills": skills,
        "education": education,
        "projects": projects,
        "experience": experience,
        "certifications": certifications,
        "section_quality": quality_result["section_quality"],
"quality_recommendations": quality_result["recommendations"],
        "ats_score": ats_score,
        "score_type": "Heuristic baseline - not an official ATS score",
        "sections": section_checks,
        "strengths": strengths,
        "improvements": improvements
    }

