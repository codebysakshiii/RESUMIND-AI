
from datetime import datetime, timezone

from app.database.connection import database
from app.core.security import hash_password, verify_password


users_collection = database["users"]


async def register_user(user_data):
    """Register a new user."""

    existing_user = await users_collection.find_one({
        "email": user_data.email
    })

    if existing_user:
        return None

    user_document = {
        "full_name": user_data.full_name,
        "email": user_data.email,
        "hashed_password": hash_password(user_data.password),
        "is_active": True,
        "created_at": datetime.now(timezone.utc)
    }

    result = await users_collection.insert_one(user_document)

    return {
        "id": str(result.inserted_id),
        "full_name": user_data.full_name,
        "email": user_data.email,
        "is_active": True
    }


async def authenticate_user(email: str, password: str):
    """Authenticate user using email and password."""

    user = await users_collection.find_one({
        "email": email
    })

    if not user:
        return None

    if not verify_password(password, user["hashed_password"]):
        return None

    if not user.get("is_active", True):
        return None

    return user
