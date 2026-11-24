
import os
import tempfile

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse

from app.core.dependencies import get_current_user
from app.database.connection import database
from app.services.pdf_service import generate_resume_pdf


router = APIRouter(
    prefix="/resume-export",
    tags=["Resume PDF Export"]
)

generated_resumes_collection = database["generated_resumes"]


@router.get("/{builder_id}/pdf")
async def export_resume_pdf(
    builder_id: str,
    current_user: dict = Depends(get_current_user)
):
    if not ObjectId.is_valid(builder_id):
        raise HTTPException(
            status_code=400,
            detail="Invalid resume builder ID."
        )

    generated_resume = await generated_resumes_collection.find_one({
        "_id": ObjectId(builder_id),
        "user_id": current_user["_id"]
    })

    if not generated_resume:
        raise HTTPException(
            status_code=404,
            detail="Generated resume not found."
        )

    resume_data = generated_resume.get("result", {}).get("resume")

    if not resume_data:
        raise HTTPException(
            status_code=404,
            detail="Resume data not found."
        )

    candidate_name = (
        resume_data.get("personal_information", {}).get("name")
        or "Candidate"
    )

    safe_name = "".join(
        character for character in candidate_name
        if character.isalnum() or character in (" ", "-", "_")
    ).strip().replace(" ", "_")

    filename = f"{safe_name or 'Candidate'}_Resume.pdf"

    try:
        with tempfile.NamedTemporaryFile(
            suffix=".pdf",
            delete=False
        ) as temp_file:
            pdf_path = temp_file.name

        generate_resume_pdf(
            resume_data=resume_data,
            output_path=pdf_path
        )

    except Exception as error:
        if "pdf_path" in locals() and os.path.exists(pdf_path):
            os.remove(pdf_path)

        raise HTTPException(
            status_code=500,
            detail=f"PDF generation failed: {str(error)}"
        )

    return FileResponse(
        path=pdf_path,
        media_type="application/pdf",
        filename=filename,
        background=None
    )
