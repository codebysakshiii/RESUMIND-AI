
import re
from uuid import uuid4


INTERVIEW_QUESTIONS = {
    "python": [
        "What are the main features of Python?",
        "Explain the difference between a list and a tuple.",
        "What is the difference between == and is?",
        "Explain Python decorators.",
        "What is exception handling in Python?",
        "What are Python dictionaries?",
        "Explain inheritance in Python.",
        "What is the purpose of virtual environments?"
    ],
    "general": [
        "Tell me about yourself.",
        "Why are you interested in this role?",
        "What are your strengths and weaknesses?",
        "Describe a challenging project you worked on.",
        "How do you handle deadlines?",
        "Where do you see yourself in five years?",
        "Why should we hire you?",
        "How do you approach problem-solving?"
    ]
}


def generate_questions(target_role: str, question_count: int = 5):
    role = target_role.lower()

    if "python" in role:
        pool = INTERVIEW_QUESTIONS["python"] + INTERVIEW_QUESTIONS["general"]
    else:
        pool = INTERVIEW_QUESTIONS["general"] + INTERVIEW_QUESTIONS["python"]

    selected = pool[:question_count]

    return [
        {
            "question_id": str(uuid4()),
            "question": question,
            "question_number": index + 1
        }
        for index, question in enumerate(selected)
    ]


def evaluate_answer(question: str, answer: str) -> dict:
    if not answer or len(answer.strip()) < 5:
        raise ValueError("Please provide a meaningful answer.")

    words = re.findall(r"\b\w+\b", answer.lower())
    word_count = len(words)

    score = min(100, round((word_count / 50) * 100))

    if word_count < 15:
        feedback = "Your answer is too short. Explain your thoughts with more detail."
    elif word_count < 40:
        feedback = "Good start. Add examples and explain your approach in more detail."
    else:
        feedback = "Your answer has good detail. Keep your explanation structured and clear."

    return {
        "score": score,
        "word_count": word_count,
        "feedback": feedback,
        "suggestions": [
            "Explain the concept clearly.",
            "Include a practical example where possible.",
            "Keep your answer relevant to the question."
        ],
        "evaluation_type": "Rule-based answer evaluation",
        "note": "This is an estimated practice score, not a professional interview assessment."
    }

def generate_interview_report(interview: dict) -> dict:
    questions = interview.get("questions", [])
    answers = interview.get("answers", [])

    total_questions = len(questions)
    answered_questions = len(answers)

    scores = [
        answer["feedback"]["score"]
        for answer in answers
        if "feedback" in answer
    ]

    average_score = (
        round(sum(scores) / len(scores))
        if scores else 0
    )

    completion_percentage = (
        round((answered_questions / total_questions) * 100)
        if total_questions else 0
    )

    return {
        "target_role": interview.get("target_role"),
        "difficulty": interview.get("difficulty"),
        "total_questions": total_questions,
        "answered_questions": answered_questions,
        "completion_percentage": completion_percentage,
        "overall_score": average_score,
        "individual_scores": scores,
        "performance_level": (
            "Excellent" if average_score >= 80
            else "Good" if average_score >= 60
            else "Needs Improvement"
        ),
        "evaluation_type": "Rule-based practice evaluation",
        "note": "Practice estimate, not a professional interview assessment."
    }
