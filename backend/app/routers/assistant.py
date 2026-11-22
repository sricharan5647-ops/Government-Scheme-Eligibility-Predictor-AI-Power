from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..schemas import AssistantQuery, AssistantResponse
from ..services.assistant import GroundedSchemeAssistant

router = APIRouter(tags=["Assistant"])

@router.post("/assistant/ask", response_model=AssistantResponse)
def ask_assistant(query: AssistantQuery, db: Session = Depends(get_db)):
    """
    Ask SchemeSathi Grounded AI Assistant.
    Retrieves official published scheme records and cites official sources and verification dates.
    """
    return GroundedSchemeAssistant.answer_query(query, db)
