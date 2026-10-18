"""User-specific prediction audit trail and history endpoints."""
from __future__ import annotations

from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, Query

from app.api.v1.endpoints.auth import get_current_user
from app.db.database import db

router = APIRouter()

@router.get("/history")
def get_prediction_history(
    limit: int = Query(default=50, ge=1, le=200),
    current_user: dict = Depends(get_current_user)
):
    """
    Retrieve past prediction history strictly isolated to the authenticated user.
    If the user has not made personal predictions yet, falls back to recent platform predictions.
    """
    user_id = current_user["id"]
    predictions = db.get_predictions(user_id=user_id, limit=limit)
    if not predictions:
        predictions = db.get_predictions(user_id=None, limit=limit)

    return {
        "user_email": current_user["email"],
        "count": len(predictions),
        "total": len(predictions),
        "history": predictions,
        "records": predictions
    }
