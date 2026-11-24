def compare_ats_scores(old_score: float, new_score: float) -> dict:
    score_difference = new_score - old_score

    if old_score > 0:
        improvement_percentage = round(
            (score_difference / old_score) * 100, 2
        )
    else:
        improvement_percentage = 0.0

    if score_difference > 0:
        status = "improved"
    elif score_difference < 0:
        status = "decreased"
    else:
        status = "unchanged"

    return {
        "old_ats_score": old_score,
        "new_ats_score": new_score,
        "score_difference": round(score_difference, 2),
        "improvement_percentage": improvement_percentage,
        "status": status
    }