import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Feedback
from ..schemas import FeedbackCreate, FeedbackResponse

router = APIRouter(tags=["Feedback"])

@router.post("/feedback", response_model=FeedbackResponse)
def submit_feedback(feedback_in: FeedbackCreate, db: Session = Depends(get_db)):
    """Submit feedback regarding broken links, outdated info, or unclear details."""
    fb = Feedback(
        scheme_id=feedback_in.scheme_id,
        feedback_type=feedback_in.feedback_type,
        message=feedback_in.message.strip(),
        created_at=datetime.datetime.now(datetime.timezone.utc),
        status="pending"
    )
    db.add(fb)
    db.commit()
    db.refresh(fb)
    return fb
