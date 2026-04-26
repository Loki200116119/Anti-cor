from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import ContactMessage
from app.schemas import ContactCreate, ContactOut

router = APIRouter(prefix="/contact", tags=["contact"])


@router.post("", response_model=ContactOut)
def create_contact(payload: ContactCreate, db: Session = Depends(get_db)):
    msg = ContactMessage(
        name=payload.name,
        email=payload.email,
        question_type=payload.question_type,
        message=payload.message,
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return {"id": msg.id, "status": "received"}
