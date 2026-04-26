from datetime import datetime, date
from typing import Any
from enum import Enum
from pydantic import BaseModel, Field, EmailStr


class ReportCategory(str, Enum):
    CORRUPTION = "corruption"
    BRIBERY = "bribery"
    MISCONDUCT = "misconduct"
    FRAUD = "fraud"
    HARASSMENT = "harassment"
    DISCRIMINATION = "discrimination"
    VIOLENCE = "violence"
    OTHER = "other"


class ReportStatus(str, Enum):
    SUBMITTED = "SUBMITTED"
    AI_CHECKED = "AI_CHECKED"
    MODERATOR_REVIEWING = "MODERATOR_REVIEWING"
    MORE_EVIDENCE_NEEDED = "MORE_EVIDENCE_NEEDED"
    SENT_TO_AGENCY = "SENT_TO_AGENCY"
    AGENCY_DEADLINE_STARTED = "AGENCY_DEADLINE_STARTED"
    CONFIRMED = "CONFIRMED"
    NOT_CONFIRMED = "NOT_CONFIRMED"
    REWARD_REVIEW = "REWARD_REVIEW"
    CLOSED = "CLOSED"


class ReportCreate(BaseModel):
    category: ReportCategory
    description: str = Field(..., min_length=10, max_length=5000)
    location: str | None = Field(None, min_length=3, max_length=255)
    region: str = Field(..., min_length=2, max_length=100)
    organization: str | None = Field(None, min_length=2, max_length=255)
    incident_date: date | None = None
    anonymous: bool = True
    danger_flag: bool = False
    contact: EmailStr | None = None
    has_evidence: bool = False


class AIResult(BaseModel):
    risk_score: int = Field(ge=0, le=100)
    category: str
    urgency: str
    evidence_strength: str
    completeness: int = Field(ge=0, le=100)
    reward_potential: str
    suggestions: list[str]
    summary: str | None = None
    next_step: str
    ai_mode: str


class EvidenceOut(BaseModel):
    id: int
    original_name: str
    content_type: str | None
    size_bytes: int
    sha256: str
    created_at: datetime

    model_config = {"from_attributes": True}


class TimelineOut(BaseModel):
    status: ReportStatus
    title: str
    description: str
    created_at: datetime

    model_config = {"from_attributes": True}


class MessageOut(BaseModel):
    sender: str
    message: str
    created_at: datetime

    model_config = {"from_attributes": True}


# Authentication Schemas
class UserRole(str, Enum):
    ADMIN = "admin"
    MODERATOR = "moderator"
    USER = "user"


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    role: UserRole = UserRole.USER
    is_active: bool = True


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    email: EmailStr | None = None
    role: UserRole | None = None


class UserOut(BaseModel):
    id: int
    email: EmailStr
    role: UserRole
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class ReportOut(BaseModel):
    id: int
    tracking_id: str
    category: str
    description: str
    location: str | None
    region: str | None
    organization: str | None
    incident_date: str | None
    anonymous: bool
    danger_flag: bool
    status: str
    ai_score: int
    ai_result: dict[str, Any] | None
    reward_status: str
    created_at: datetime
    updated_at: datetime
    evidence_files: list[EvidenceOut] = []
    timeline: list[TimelineOut] = []
    messages: list[MessageOut] = []

    model_config = {"from_attributes": True}


class ReportCreated(BaseModel):
    tracking_id: str
    status: str
    ai_result: dict[str, Any]
    report: ReportOut


class StatusUpdate(BaseModel):
    status: str
    message: str | None = None


class ModeratorMessageCreate(BaseModel):
    sender: str = "Moderator"
    message: str = Field(..., min_length=2)


class ContactCreate(BaseModel):
    name: str | None = None
    email: str = Field(..., min_length=5)
    question_type: str = "other"
    message: str = Field(..., min_length=5)


class ContactOut(BaseModel):
    id: int
    status: str = "received"
