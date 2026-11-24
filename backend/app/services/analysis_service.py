
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

   
    action_words = [
        "developed", "developing",
        "built", "building",
        "created", "creating",
        "designed", "designing",
        "implemented", "engineered",
        "analyzed"
    ]

    has_action_word = any(
        re.search(
            r"\b" + re.escape(word) + r"\b",
            summary_text.lower()
        )
        for word in action_words
    )

    if has_action_word:
        summary_score += 25
    else:
        recommendations.append(
            "Use action-oriented language in your professional summary."
        )

    if 15 <= summary_words <= 100:
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

    summary_improvement = generate_summary_improvement(
    sections.get("summary", [])
    )
    project_improvements = generate_project_improvements(projects)
    project_metrics = analyze_project_metrics(projects)
    skill_recommendations = recommend_missing_skills(skills, projects)
    priority_checklist = generate_priority_checklist(
    summary_improvement,
    project_improvements,
    project_metrics,
    skill_recommendations
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
        "improvements": improvements,
        "summary_improvement": summary_improvement,
        "project_improvements": project_improvements,
        "project_metrics": project_metrics,
        "skill_recommendations": skill_recommendations,
         "priority_checklist": priority_checklist,
    }



def generate_summary_improvement(summary_lines: list) -> dict:
    """Analyze and suggest improvements for a professional summary."""

    import re

    summary = " ".join(summary_lines).strip()
    normalized = re.sub(r"[^a-z0-9+#]+", " ", summary.lower())
    word_count = len(summary.split())

    result = {
        "original_summary": summary,
        "word_count": word_count,
        "status": "needs_improvement",
        "suggestions": [],
        "missing_elements": []
    }

    if not summary:
        result["suggestions"].append(
            "Add a professional summary describing your education, "
            "technical skills and career goals."
        )
        result["missing_elements"].append("Professional summary")
        return result

    if word_count < 30:
        result["suggestions"].append(
            "Expand your summary to approximately 30-70 meaningful words."
        )

    if word_count > 100:
        result["suggestions"].append(
            "Shorten your summary and focus on relevant information."
        )

    action_words = [
        "developed", "developing", "built", "building",
        "created", "creating", "designed", "designing",
        "implemented", "engineered", "analyzed"
    ]

    if not any(word in normalized.split() for word in action_words):
        result["suggestions"].append(
            "Use strong action verbs such as Developed, Built or Implemented."
        )

    technical_terms = [
        "python", "java", "javascript", "c++", "sql",
        "react", "machine learning", "computer vision",
        "frontend development", "backend development",
        "artificial intelligence", "ai", "html", "css"
    ]

    if not any(term in normalized for term in technical_terms):
        result["missing_elements"].append("Relevant technical skills")
        result["suggestions"].append(
            "Mention your most relevant technical skills."
        )

    career_terms = [
        "career", "seeking", "aspiring", "goal",
        "interested", "looking for", "looking to"
    ]

    if not any(term in normalized for term in career_terms):
        result["missing_elements"].append("Career objective")
        result["suggestions"].append(
            "Include your career interests or professional goal."
        )

    result["status"] = (
        "good" if not result["suggestions"]
        else "needs_improvement"
    )

    return result



def generate_project_improvements(projects: list) -> list:
    """Analyze project descriptions and generate meaningful suggestions."""

    improvements = []

    action_verbs = [
        "developed", "built", "created", "designed",
        "implemented", "engineered", "integrated",
        "automated", "implemented", "configured",
        "deployed", "analyzed", "optimized"
    ]

    for project in projects:
        description = project.get("description", "").strip()
        title = project.get("title", "Untitled Project")
        technologies = project.get("technologies", [])

        suggestions = []
        words = description.split()
        word_count = len(words)

        # 1. Check project description
        if not description:
            suggestions.append(
                "Add a clear description explaining what the project does."
            )

        elif word_count < 10:
            suggestions.append(
                "Expand the description with more details about its functionality."
            )

        # 2. Check action-oriented language
        normalized_description = description.lower()

        has_action_verb = any(
            re.search(r"\b" + re.escape(verb) + r"\b", normalized_description)
            for verb in action_verbs
        )

        if description and not has_action_verb:
            suggestions.append(
                "Start with a strong action verb such as Developed, Built or Implemented."
            )

        # 3. Check technologies
        if not technologies:
            suggestions.append(
                "Mention the programming languages, frameworks and tools used."
            )

        improvements.append({
            "project_title": title,
            "original_description": description,
            "word_count": word_count,
            "suggestions": suggestions,
            "status": "needs_improvement" if suggestions else "good"
        })

    return improvements



def analyze_project_metrics(projects: list) -> list:
    """Identify measurable results in project descriptions."""

    import re

    results = []

    metric_pattern = re.compile(
          r"\b\d+(?:\.\d+)?\s*(?:%|percent\b|\busers\b|\brecords\b|"
    r"\bseconds\b|\bminutes\b|\bhours\b|\bms\b|"
    r"\bmilliseconds\b|\bprojects\b|\bimages\b|"
    r"\bframes\b|\baccuracy\b)",
    re.IGNORECASE
    )

    for project in projects:
        description = project.get("description", "")

        has_metrics = bool(metric_pattern.search(description))

        results.append({
            "project_title": project.get("title", "Untitled Project"),
            "has_measurable_metrics": has_metrics,
            "status": "good" if has_metrics else "metrics_missing",
            "suggestion": (
                "Measurable results identified."
                if has_metrics
                else "Add genuine measurable results, such as accuracy, "
                     "processing time, number of users or performance improvement, "
                     "if you have verified data."
            )
        })

    return results



def recommend_missing_skills(skills: list, projects: list) -> dict:
    """Recommend skills using resume skills and project technologies."""

    skill_set = {skill.lower().strip() for skill in skills}

    for project in projects:
        for tech in project.get("technologies", []):
            skill_set.add(tech.lower().strip())

    skill_paths = {
        "Frontend Development": [
            "html", "css", "javascript", "react",
            "typescript", "tailwind"
        ],
        "Backend Development": [
            "python", "fastapi", "flask", "django",
            "node.js", "express", "mongodb", "sql"
        ],
        "AI and Computer Vision": [
            "python", "computer vision", "opencv",
            "mediapipe", "numpy", "pandas",
            "tensorflow", "pytorch"
        ]
    }

    recommendations = {}

    for category, path_skills in skill_paths.items():
        existing = [
            skill for skill in path_skills
            if skill in skill_set
        ]

        missing = [
            skill for skill in path_skills
            if skill not in skill_set
        ]

        if existing:
            recommendations[category] = {
                "existing_skills": existing,
                "suggested_skills": missing[:4]
            }

    return {
        "recommendations": recommendations,
        "note": (
            "Suggested skills are learning recommendations, "
            "not verified candidate skills."
        )
    }


def generate_priority_checklist(
    summary_improvement: dict,
    project_improvements: list,
    project_metrics: list,
    skill_recommendations: dict
) -> list:
    """Generate a prioritized resume improvement checklist."""

    checklist = []

    # HIGH PRIORITY: Professional summary
    if summary_improvement.get("status") == "needs_improvement":
        checklist.append({
            "priority": "High",
            "task": "Improve Professional Summary",
            "reason": "Make your career goal and technical strengths clearer."
        })

    # HIGH PRIORITY: Project descriptions
    weak_projects = [
        project for project in project_improvements
        if project.get("status") == "needs_improvement"
    ]

    if weak_projects:
        checklist.append({
            "priority": "High",
            "task": "Improve Project Descriptions",
            "reason": (
                f"{len(weak_projects)} project(s) need clearer "
                "descriptions or stronger action verbs."
            )
        })

    # MEDIUM PRIORITY: Project metrics
    missing_metrics = [
        project for project in project_metrics
        if not project.get("has_measurable_metrics")
    ]

    if missing_metrics:
        checklist.append({
            "priority": "Medium",
            "task": "Add Verified Project Metrics",
            "reason": (
                f"{len(missing_metrics)} project(s) lack measurable results. "
                "Add genuine numbers only when available."
            )
        })

    # MEDIUM PRIORITY: Skill development
    recommendations = skill_recommendations.get(
        "recommendations", {}
    )

    if recommendations:
        checklist.append({
            "priority": "Medium",
            "task": "Develop Relevant Technical Skills",
            "reason": (
                "Explore suggested skills that match your "
                "career interests and target roles."
            )
        })

    if not checklist:
        checklist.append({
            "priority": "Low",
            "task": "Continue Improving Your Resume",
            "reason": "Your current resume checks show no major issues."
        })

    return checklist
