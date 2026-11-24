
import os
from xml.sax.saxutils import escape

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    HRFlowable,
    KeepTogether
)


def generate_resume_pdf(resume_data: dict, output_path: str) -> str:
    """
    Generate a professional, multi-page ATS-friendly resume PDF.
    """

    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)

    document = SimpleDocTemplate(
        output_path,
        pagesize=A4,
        rightMargin=18 * mm,
        leftMargin=18 * mm,
        topMargin=16 * mm,
        bottomMargin=16 * mm,
        title="Professional Resume",
        author=resume_data.get("personal_information", {}).get("name", "")
    )

    styles = getSampleStyleSheet()

    name_style = ParagraphStyle(
        "CandidateName",
        parent=styles["Title"],
        fontName="Helvetica-Bold",
        fontSize=22,
        leading=27,
        alignment=TA_CENTER,
        textColor=colors.HexColor("#19382C"),
        spaceAfter=5
    )

    contact_style = ParagraphStyle(
        "Contact",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9,
        leading=13,
        alignment=TA_CENTER,
        textColor=colors.HexColor("#555555"),
        spaceAfter=12
    )

    heading_style = ParagraphStyle(
        "SectionHeading",
        parent=styles["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=11,
        leading=14,
        textColor=colors.HexColor("#19382C"),
        spaceBefore=12,
        spaceAfter=5,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        "ResumeBody",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9.5,
        leading=14,
        textColor=colors.HexColor("#292929"),
        spaceAfter=5
    )

    small_style = ParagraphStyle(
        "SmallText",
        parent=body_style,
        fontSize=9,
        leading=12
    )

    story = []

    personal = resume_data.get("personal_information", {})

    name = personal.get("name") or "Candidate Name"
    email = personal.get("email", "")
    phone = personal.get("phone", "")

    contact_parts = [
        escape(str(value))
        for value in [email, phone]
        if value
    ]

    story.append(Paragraph(escape(str(name)), name_style))

    if contact_parts:
        story.append(
            Paragraph(" | ".join(contact_parts), contact_style)
        )

    story.append(
        HRFlowable(
            width="100%",
            thickness=1,
            color=colors.HexColor("#19382C"),
            spaceAfter=8
        )
    )

    def add_section(title: str, content):
        if not content:
            return

        story.append(Paragraph(title.upper(), heading_style))

        story.append(
            HRFlowable(
                width="100%",
                thickness=0.5,
                color=colors.HexColor("#D5DDD8"),
                spaceAfter=6
            )
        )

        if isinstance(content, list):
            for item in content:
                if isinstance(item, dict):
                    continue

                story.append(
                    Paragraph(
                        escape(str(item)),
                        body_style,
                        bulletText="\u2022"
                    )
                )
        else:
            story.append(
                Paragraph(escape(str(content)), body_style)
            )

    # Professional Summary
    add_section(
        "Professional Summary",
        resume_data.get("professional_summary", "")
    )

    # Target Role
    target_role = resume_data.get("target_role", "")

    if target_role:
        story.append(
            Paragraph(
                f"<b>Target Role:</b> {escape(str(target_role))}",
                small_style
            )
        )

    # Technical Skills
    skills = resume_data.get("technical_skills", [])

    if skills:
        skill_text = "  |  ".join(
            escape(str(skill)) for skill in skills
        )
        add_section("Technical Skills", skill_text)

    # Education
    add_section("Education", resume_data.get("education", []))

    # Projects
    projects = resume_data.get("projects", [])

    if projects:
        story.append(Paragraph("PROJECTS", heading_style))

        story.append(
            HRFlowable(
                width="100%",
                thickness=0.5,
                color=colors.HexColor("#D5DDD8"),
                spaceAfter=6
            )
        )

        for project in projects:
            if not isinstance(project, dict):
                project = {"title": str(project)}

            title = escape(str(project.get("title", "Project")))
            description = escape(
                str(project.get("description", ""))
            )
            technologies = project.get("technologies", [])

            project_content = [
                Paragraph(
                    f"<b>{title}</b>",
                    body_style
                )
            ]

            if description:
                project_content.append(
                    Paragraph(description, small_style)
                )

            if technologies:
                tech_text = ", ".join(
                    escape(str(tech)) for tech in technologies
                )
                project_content.append(
                    Paragraph(
                        f"<b>Technologies:</b> {tech_text}",
                        small_style
                    )
                )

            project_content.append(Spacer(1, 5))

            story.append(KeepTogether(project_content))

    # Experience
    add_section("Experience", resume_data.get("experience", []))

    # Certifications
    add_section(
        "Certifications",
        resume_data.get("certifications", [])
    )

    def add_page_number(canvas, doc):
        canvas.saveState()
        canvas.setFont("Helvetica", 8)
        canvas.setFillColor(colors.HexColor("#777777"))
        canvas.drawCentredString(
            A4[0] / 2,
            9 * mm,
            f"Page {doc.page}"
        )
        canvas.restoreState()

    document.build(
        story,
        onFirstPage=add_page_number,
        onLaterPages=add_page_number
    )

    return output_path
