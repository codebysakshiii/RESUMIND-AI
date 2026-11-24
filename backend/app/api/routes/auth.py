
from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, Field

from app.schemas.auth import UserRegister, UserLogin, TokenResponse
from app.services.auth_service import register_user, authenticate_user
from app.core.security import create_access_token
from app.core.dependencies import get_current_user
from app.database.connection import database

router = APIRouter(prefix="/auth", tags=["Authentication"])

users_collection = database["users"]


# -------------------------------
# USER REGISTER
# -------------------------------

@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(data: UserRegister):

    user = await register_user(data)

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered"
        )

    return {
        "success": True,
        "message": "Account created successfully",
        "user": user
    }


# -------------------------------
# USER LOGIN
# -------------------------------

@router.post("/login", response_model=TokenResponse)
async def login(data: UserLogin):

    user = await authenticate_user(data.email, data.password)

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    access_token = create_access_token({
        "sub": str(user["_id"])
    })

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": str(user["_id"]),
            "full_name": user["full_name"],
            "email": user["email"],
            "is_active": user.get("is_active", True)
        }
    }


# -------------------------------
# GET CURRENT USER PROFILE
# -------------------------------

@router.get("/me")
async def get_my_profile(
    current_user: dict = Depends(get_current_user)
):

    return {
        "success": True,
        "message": "Profile fetched successfully",
        "user": {
            "id": str(current_user["_id"]),
            "full_name": current_user["full_name"],
            "email": current_user["email"],
            "is_active": current_user.get("is_active", True),
            "created_at": current_user.get("created_at")
        }
    }


# -------------------------------
# UPDATE PROFILE SCHEMA
# -------------------------------

class UserProfileUpdate(BaseModel):

    full_name: str = Field(
        ...,
        min_length=2,
        max_length=100
    )


# -------------------------------
# UPDATE CURRENT USER PROFILE
# -------------------------------

@router.put("/me")
async def update_my_profile(
    data: UserProfileUpdate,
    current_user: dict = Depends(get_current_user)
):

    await users_collection.update_one(
        {"_id": current_user["_id"]},
        {
            "$set": {
                "full_name": data.full_name.strip()
            }
        }
    )

    updated_user = await users_collection.find_one(
        {"_id": current_user["_id"]}
    )

    return {
        "success": True,
        "message": "Profile updated successfully",
        "user": {
            "id": str(updated_user["_id"]),
            "full_name": updated_user["full_name"],
            "email": updated_user["email"],
            "is_active": updated_user.get("is_active", True)
        }
    }
