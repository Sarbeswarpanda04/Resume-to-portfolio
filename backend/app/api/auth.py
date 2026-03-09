from fastapi import APIRouter, HTTPException
from datetime import datetime
from app.models.schemas import User, UserCreate
from app.core.security import create_access_token
from app.services import firebase_db

router = APIRouter()


@router.post("/register")
async def register(user: UserCreate):
    """Register a new user with Firebase UID"""
    # In production, verify Firebase token here
    # For now, we'll create a JWT token
    
    # Create user profile in Firestore
    user_data = {
        "id": user.firebase_uid,
        "email": user.email,
        "displayName": user.email.split('@')[0],
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow(),
        "portfolioCount": 0,
        "resumeCount": 0,
    }
    firebase_db.create_user_if_not_exists(user.firebase_uid, user_data)
    
    access_token = create_access_token(data={"sub": user.firebase_uid})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "email": user.email,
            "firebase_uid": user.firebase_uid,
        },
    }


@router.post("/login")
async def login(firebase_uid: str):
    """Login user with Firebase UID"""
    # Verify Firebase token in production
    
    # Ensure user exists in Firestore
    user = firebase_db.get_user(firebase_uid)
    if not user:
        user_data = {
            "id": firebase_uid,
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow(),
        }
        firebase_db.create_user_if_not_exists(firebase_uid, user_data)
    
    access_token = create_access_token(data={"sub": firebase_uid})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
    }


@router.get("/me")
async def get_current_user_info():
    """Get current user information"""
    return {"message": "User info endpoint"}
