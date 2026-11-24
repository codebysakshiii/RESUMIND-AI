
from io import BytesIO
from datetime import datetime, timezone

import fitz
from docx import Document
from bson import ObjectId

from app.database.connection import database


resumes_collection = database["resumes"]


def extract_pdf_text(file_content: bytes) -> str:
    text_parts = []

    with fitz.open(stream=file_content, filetype="pdf") as pdf:
        for page in pdf:
            text_parts.append(page.get_text())

    return "\n".join(text_parts).strip()


def extract_docx_text(file_content: bytes) -> str:
    document = Document(BytesIO(file_content))

    text_parts = [
        paragraph.text
        for paragraph in document.paragraphs
        if paragraph.text.strip()
    ]

    for table in document.tables:
        for row in table.rows:
            for cell in row.cells:
                if cell.text.strip():
                    text_parts.append(cell.text.strip())

    return "\n".join(text_parts).strip()


async def save_resume(
    user_id: str,
    filename: str,
    file_type: str,
    file_size: int,
    extracted_text: str
):
    resume_data = {
        "user_id": ObjectId(user_id),
        "filename": filename,
        "file_type": file_type,
        "file_size": file_size,
        "extracted_text": extracted_text,
        "created_at": datetime.now(timezone.utc),
        "status": "uploaded"
    }

    result = await resumes_collection.insert_one(resume_data)

    return str(result.inserted_id)
