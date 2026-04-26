from datetime import datetime, date
from sqlalchemy import Boolean, Date, DateTime, Enum as SQLEnum, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base
from app.schemas import ReportCategory, ReportStatus, UserRole


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255))
    role: Mapped[UserRole] = mapped_column(SQLEnum(UserRole), default=UserRole.USER)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Report(Base):
    __tablename__ = "reports"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    tracking_id: Mapped[str] = mapped_column(String(32), unique=True, index=True)
    category: Mapped[ReportCategory] = mapped_column(SQLEnum(ReportCategory), index=True)
    description: Mapped[str] = mapped_column(Text)
    location: Mapped[str | None] = mapped_column(String(255), nullable=True)
    region: Mapped[str] = mapped_column(String(80), index=True)
    organization: Mapped[str | None] = mapped_column(String(255), nullable=True)
    incident_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    anonymous: Mapped[bool] = mapped_column(Boolean, default=True)
    danger_flag: Mapped[bool] = mapped_column(Boolean, default=False)
    contact: Mapped[str | None] = mapped_column(String(255), nullable=True)

    status: Mapped[ReportStatus] = mapped_column(SQLEnum(ReportStatus), default=ReportStatus.AI_CHECKED, index=True)
    ai_score: Mapped[int] = mapped_column(Integer, default=0)
    ai_result: Mapped[str | None] = mapped_column(Text, nullable=True)
    reward_status: Mapped[str] = mapped_column(String(64), default="not_eligible_yet")

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    evidence_files: Mapped[list["EvidenceFile"]] = relationship(back_populates="report", cascade="all, delete-orphan")
    timeline: Mapped[list["TimelineEvent"]] = relationship(back_populates="report", cascade="all, delete-orphan")
    messages: Mapped[list["ModeratorMessage"]] = relationship(back_populates="report", cascade="all, delete-orphan")


class EvidenceFile(Base):
    __tablename__ = "evidence_files"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    report_id: Mapped[int] = mapped_column(ForeignKey("reports.id"), index=True)
    original_name: Mapped[str] = mapped_column(String(255))
    stored_name: Mapped[str] = mapped_column(String(255))
    content_type: Mapped[str | None] = mapped_column(String(128), nullable=True)
    size_bytes: Mapped[int] = mapped_column(Integer, default=0)
    sha256: Mapped[str] = mapped_column(String(64), index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    report: Mapped[Report] = relationship(back_populates="evidence_files")


class TimelineEvent(Base):
    __tablename__ = "timeline_events"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    report_id: Mapped[int] = mapped_column(ForeignKey("reports.id"), index=True)
    status: Mapped[ReportStatus] = mapped_column(SQLEnum(ReportStatus))
    title: Mapped[str] = mapped_column(String(255))
    description: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    report: Mapped[Report] = relationship(back_populates="timeline")


class ModeratorMessage(Base):
    __tablename__ = "moderator_messages"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    report_id: Mapped[int] = mapped_column(ForeignKey("reports.id"), index=True)
    sender: Mapped[str] = mapped_column(String(64), default="Moderator")
    message: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    report: Mapped[Report] = relationship(back_populates="messages")


class ContactMessage(Base):
    __tablename__ = "contact_messages"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    email: Mapped[str] = mapped_column(String(255))
    question_type: Mapped[str] = mapped_column(String(80), default="other")
    message: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
