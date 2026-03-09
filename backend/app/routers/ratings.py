from fastapi import APIRouter, Depends, HTTPException
from typing import Dict
from datetime import datetime

from app.core.security import get_current_user
from app.services.firebase_db import firebase_db

router = APIRouter()

@router.post("/ratings")
async def create_rating(payload: Dict, current_user: dict = Depends(get_current_user)) -> Dict:
    """Store a 1-5 rating for a portfolio (one per user per portfolio)."""
    if not firebase_db.is_available():
        raise HTTPException(status_code=503, detail="Firebase is not available")

    portfolio_id = payload.get("portfolioId")
    rating = payload.get("rating")

    if not portfolio_id or rating is None:
        raise HTTPException(status_code=400, detail="portfolioId and rating are required")

    try:
        rating_value = int(rating)
    except Exception:
        raise HTTPException(status_code=400, detail="rating must be an integer")

    if rating_value < 1 or rating_value > 5:
        raise HTTPException(status_code=400, detail="rating must be between 1 and 5")

    user_id = current_user.get("user_id")
    doc_id = f"{portfolio_id}_{user_id}"

    data = {
        "portfolioId": portfolio_id,
        "userId": user_id,
        "rating": rating_value,
        "createdAt": datetime.utcnow(),
    }

    # Upsert (ensures one rating per user+portfolio)
    firebase_db.ratings.document(doc_id).set(data)

    return {"ok": True, "rating": rating_value}
