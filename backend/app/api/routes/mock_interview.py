
from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId

from app.core.dependencies import get_current_user
from app.database.connection import database
from app.schemas.mock_interview import (
    InterviewStartRequest,
    InterviewStartResponse,
    InterviewAnswerRequest,
    InterviewAnswerResponse
)
from app.services.mock_interview_service import (
    generate_questions,
    evaluate_answer,
    generate_interview_report
)

router = APIRouter(
    prefix="/mock-interview",
    tags=["AI Mock Interview"]
)

resumes_collection = database["resumes"]
interviews_collection = database["mock_interviews"]


@router.post("/start", response_model=InterviewStartResponse)
async def start_interview(
    request: InterviewStartRequest,
    current_user: dict = Depends(get_current_user)
):
    
    if not ObjectId.is_valid(request.resume_id):
        raise HTTPException(
            status_code=400,
            detail="Invalid resume ID."
        )

    print("CURRENT USER ID:", current_user["_id"])
    print("RESUME ID RECEIVED:", request.resume_id)
    print("RESUME ID VALID:", ObjectId.is_valid(request.resume_id))

    resume = await resumes_collection.find_one({
        "_id": ObjectId(request.resume_id),
        "user_id": current_user["_id"]
    })

    print("RESUME FOUND:", resume is not None)

    if not resume:
        raise HTTPException(
            status_code=404,
            detail="Resume not found."
        )


    if request.difficulty.lower() not in [
        "beginner", "intermediate", "advanced"
    ]:
        raise HTTPException(
            status_code=400,
            detail="Difficulty must be beginner, intermediate or advanced."
        )

    questions = generate_questions(
        request.target_role,
        request.question_count
    )

    interview_document = {
        "user_id": current_user["_id"],
        "resume_id": ObjectId(request.resume_id),
        "target_role": request.target_role,
        "difficulty": request.difficulty.lower(),
        "questions": questions,
        "answers": [],
        "status": "in_progress"
    }

    saved_interview = await interviews_collection.insert_one(
        interview_document
    )

    return {
        "success": True,
        "message": "Mock interview started successfully!",
        "session_id": str(saved_interview.inserted_id),
        "questions": questions
    }


@router.post("/{session_id}/answer", response_model=InterviewAnswerResponse)
async def submit_answer(
    session_id: str,
    request: InterviewAnswerRequest,
    current_user: dict = Depends(get_current_user)
):
    if not ObjectId.is_valid(session_id):
        raise HTTPException(
            status_code=400,
            detail="Invalid interview session ID."
        )

    interview = await interviews_collection.find_one({
        "_id": ObjectId(session_id),
        "user_id": current_user["_id"]
    })

    if not interview:
        raise HTTPException(
            status_code=404,
            detail="Interview session not found."
        )

    if interview.get("status") != "in_progress":
        raise HTTPException(
            status_code=400,
            detail="This interview session is not active."
        )

    valid_question = next(
        (
            question for question in interview["questions"]
            if question["question_id"] == request.question_id
            and question["question"] == request.question
        ),
        None
    )

    if not valid_question:
        raise HTTPException(
            status_code=400,
            detail="Invalid question for this interview session."
        )

    already_answered = any(
        answer["question_id"] == request.question_id
        for answer in interview.get("answers", [])
    )

    if already_answered:
        raise HTTPException(
            status_code=409,
            detail="This question has already been answered."
        )

    try:
        feedback = evaluate_answer(
            request.question,
            request.answer
        )
    except ValueError as error:
        raise HTTPException(
            status_code=422,
            detail=str(error)
        )

    await interviews_collection.update_one(
        {"_id": ObjectId(session_id)},
        {
            "$push": {
                "answers": {
                    "question_id": request.question_id,
                    "question": request.question,
                    "answer": request.answer,
                    "feedback": feedback
                }
            }
        }
    )

    return {
        "success": True,
        "message": "Answer evaluated successfully!",
        "feedback": feedback
    }

@router.get("/{session_id}/report")
async def get_interview_report(
    session_id: str,
    current_user: dict = Depends(get_current_user)
):
    if not ObjectId.is_valid(session_id):
        raise HTTPException(
            status_code=400,
            detail="Invalid interview session ID."
        )

    interview = await interviews_collection.find_one({
        "_id": ObjectId(session_id),
        "user_id": current_user["_id"]
    })

    if not interview:
        raise HTTPException(
            status_code=404,
            detail="Interview session not found."
        )

    report = generate_interview_report(interview)

    return {
        "success": True,
        "message": "Interview report generated successfully!",
        "session_id": session_id,
        "report": report
    }
