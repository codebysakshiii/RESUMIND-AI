
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from bson import ObjectId

from app.core.config import settings
from app.database.connection import database


security_scheme = HTTPBearer(auto_error=False)

users_collection = database["users"]


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security_scheme)
):
    """Verify JWT and return the authenticated user."""

    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token is missing",
            headers={"WWW-Authenticate": "Bearer"}
        )

    token = credentials.credentials

    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM]
        )

        user_id = payload.get("sub")

        if not user_id:
            raise HTTPException(
                status_code=401,
                detail="Invalid authentication token"
            )

        if not ObjectId.is_valid(user_id):
            raise HTTPException(
                status_code=401,
                detail="Invalid user ID"
            )

    except JWTError:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired authentication token"
        )

    user = await users_collection.find_one({
        "_id": ObjectId(user_id)
    })

    if not user or not user.get("is_active", True):
        raise HTTPException(
            status_code=401,
            detail="User not found or inactive"
        )

    return user
