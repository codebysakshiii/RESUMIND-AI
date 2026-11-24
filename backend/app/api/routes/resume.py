
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, status

from app.core.dependencies import get_current_user
from app.services.resume_service import (
    extract_pdf_text,
    extract_docx_text,
    save_resume
)

router = APIRouter(prefix="/resumes", tags=["Resume Intelligence"])

MAX_FILE_SIZE = 5 * 1024 * 1024


@router.post("/upload", status_code=status.HTTP_201_CREATED)
async def upload_resume(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    filename = file.filename or ""
    extension = filename.lower().rsplit(".", 1)[-1] if "." in filename else ""

    if extension not in ["pdf", "docx"]:
        raise HTTPException(
            status_code=400,
            detail="Only PDF and DOCX files are allowed"
        )

    file_content = await file.read(MAX_FILE_SIZE + 1)

    if not file_content:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")

    if len(file_content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail="File size must not exceed 5 MB"
        )

    try:
        if extension == "pdf":
            extracted_text = extract_pdf_text(file_content)
        else:
            extracted_text = extract_docx_text(file_content)

    except Exception:
        raise HTTPException(
            status_code=422,
            detail="Unable to read this file. Please upload a valid PDF or DOCX."
        )

    if not extracted_text.strip():
        raise HTTPException(
            status_code=422,
            detail="No readable text found in resume. Image-only PDFs are not supported yet."
        )

    resume_id = await save_resume(
        user_id=str(current_user["_id"]),
        filename=filename,
        file_type=extension,
        file_size=len(file_content),
        extracted_text=extracted_text
    )

    return {
        "success": True,
        "message": "Resume uploaded and text extracted successfully!",
        "resume_id": resume_id,
        "filename": filename,
        "file_type": extension,
        "text_length": len(extracted_text),
        "preview": extracted_text[:500]
    }
