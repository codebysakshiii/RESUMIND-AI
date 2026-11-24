
def normalize_list(value):
    """Convert section data into a consistent list."""
    if value is None:
        return []

    if isinstance(value, list):
        return [str(item).strip() for item in value if str(item).strip()]

    if isinstance(value, dict):
        return [str(value)]

    if isinstance(value, str):
        return [item.strip() for item in value.split(",") if item.strip()]

    return [str(value)]


def compare_lists(old_data, new_data):
    """Find added and removed items between two sections."""
    old_items = normalize_list(old_data)
    new_items = normalize_list(new_data)

    old_map = {item.casefold(): item for item in old_items}
    new_map = {item.casefold(): item for item in new_items}

    added = [
        new_map[key]
        for key in new_map
        if key not in old_map
    ]

    removed = [
        old_map[key]
        for key in old_map
        if key not in new_map
    ]

    return {
        "old_count": len(old_items),
        "new_count": len(new_items),
        "added": added,
        "removed": removed,
        "unchanged": [
            new_map[key]
            for key in new_map
            if key in old_map
        ],
    }


def compare_resume_versions(old_result, new_result):
    """Compare two generated resume versions."""

    old_resume = old_result.get("resume", {})
    new_resume = new_result.get("resume", {})

    if not isinstance(old_resume, dict):
        old_resume = {}

    if not isinstance(new_resume, dict):
        new_resume = {}

    sections = [
        "technical_skills",
        "education",
        "projects",
        "experience",
        "certifications",
    ]

    section_comparison = {}

    total_added = 0
    total_removed = 0

    for section in sections:
        result = compare_lists(
            old_resume.get(section, []),
            new_resume.get(section, [])
        )

        section_comparison[section] = result

        total_added += len(result["added"])
        total_removed += len(result["removed"])

    old_summary = old_resume.get("professional_summary", "")
    new_summary = new_resume.get("professional_summary", "")

    old_personal = old_resume.get("personal_information", {})
    new_personal = new_resume.get("personal_information", {})

    personal_information_changed = old_personal != new_personal

    summary_changed = old_summary != new_summary

    role_changed = (
        old_resume.get("target_role", "")
        != new_resume.get("target_role", "")
    )

    template_changed = (
        old_resume.get("template", "")
        != new_resume.get("template", "")
    )

    changes = {
        "professional_summary": {
            "changed": summary_changed,
            "old": old_summary,
            "new": new_summary,
        },
        "personal_information": {
            "changed": personal_information_changed,
        },
        "target_role": {
            "changed": role_changed,
            "old": old_resume.get("target_role", ""),
            "new": new_resume.get("target_role", ""),
        },
        "template": {
            "changed": template_changed,
            "old": old_resume.get("template", ""),
            "new": new_resume.get("template", ""),
        },
    }

    return {
        "section_comparison": section_comparison,
        "changes": changes,
        "summary": {
            "total_items_added": total_added,
            "total_items_removed": total_removed,
            "sections_compared": len(sections),
            "summary_changed": summary_changed,
            "personal_information_changed": personal_information_changed,
            "target_role_changed": role_changed,
            "template_changed": template_changed,
        },
        "comparison_type": "Structured resume version comparison",
        "note": (
            "Changes are calculated by comparing saved resume data. "
            "An added item does not necessarily mean an improvement."
        ),
    }
