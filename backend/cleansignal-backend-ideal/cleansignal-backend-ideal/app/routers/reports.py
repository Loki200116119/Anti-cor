import json
import os
from datetime import datetime
from fastapi import APIRouter, Depends, File, HTTPException, Request, UploadFile
from sqlalchemy import desc
from sqlalchemy.orm import Session, selectinload
# from slowapi import Limiter
# from slowapi.util import get_remote_address

from app.ai import analyze_report
from app.auth import get_current_moderator_user, get_current_active_user
from app.database import get_db
from app.logging_config import logger
from app.models import EvidenceFile, ModeratorMessage, Report, TimelineEvent, User
from app.rate_limits import REPORT_CREATE_LIMIT, REPORT_LIST_LIMIT, FILE_UPLOAD_LIMIT
from app.schemas import ModeratorMessageCreate, ReportCreate, ReportCreated, ReportOut, ReportStatus, StatusUpdate
from app.security import validate_file_security, calculate_file_hash, secure_filename, sanitize_pii_data
from app.utils import ensure_upload_dir, generate_tracking_id

router = APIRouter(prefix="/reports", tags=["reports"])

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "app/uploads")


def _load_report_or_404(db: Session, report_id: int) -> Report:
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report


def _report_to_out(report: Report) -> ReportOut:
    # Parse ai_result from JSON string to dict before validation
    ai_result_dict = None
    if isinstance(report.ai_result, str) and report.ai_result:
        try:
            ai_result_dict = json.loads(report.ai_result)
        except Exception:
            ai_result_dict = None
    
    # Create dict from report and override ai_result
    report_dict = {
        "id": report.id,
        "tracking_id": report.tracking_id,
        "category": report.category,
        "description": report.description,
        "location": report.location,
        "region": report.region,
        "organization": report.organization,
        "incident_date": report.incident_date,
        "anonymous": report.anonymous,
        "danger_flag": report.danger_flag,
        "status": report.status,
        "ai_score": report.ai_score,
        "ai_result": ai_result_dict,
        "reward_status": report.reward_status,
        "created_at": report.created_at,
        "updated_at": report.updated_at,
        "evidence_files": report.evidence_files or [],
        "timeline": report.timeline or [],
        "messages": report.messages or [],
    }
    return ReportOut.model_validate(report_dict)


def add_timeline(db: Session, report: Report, status: ReportStatus, title: str, description: str) -> None:
    db.add(TimelineEvent(report_id=report.id, status=status, title=title, description=description))


def _validate_report_quality(payload: ReportCreate) -> tuple[bool, str]:
    """Validate report meets professional international standards."""
    import re
    
    description = (payload.description or "").strip()
    category = (payload.category or "").strip()
    region = (payload.region or "").strip()
    
    # ===== WORD COUNT VALIDATION - PRIMARY CHECK =====
    words = description.split()
    if len(words) < 10:
        return False, "Description must contain at least 10 words. Please provide more details about the incident."
    
    # ===== BASIC CONTENT CHECKS =====
    if len(description) < 20:
        return False, "Description is too short. Write at least 10 meaningful words."
    
    if len(description) > 5000:
        return False, "Description exceeds 5000 characters. Please be more concise."
    
    # ===== REQUIRED FIELDS VALIDATION =====
    if not category:
        return False, "Category is required. Please select a category."
    
    if not region:
        return False, "Region is required. Please select a region."
    
    return True, ""


@router.post("", response_model=ReportCreated)
# @limiter.limit(REPORT_CREATE_LIMIT)
def create_report(
    request: Request,
    payload: ReportCreate,
    db: Session = Depends(get_db)
):
    """Create a new report with comprehensive validation and security."""
    logger.info("Report creation attempt", category=payload.category, region=payload.region)

    # Validate report quality first
    is_valid, error_msg = _validate_report_quality(payload)
    if not is_valid:
        logger.warning("Report validation failed", error=error_msg)
        raise HTTPException(status_code=400, detail=error_msg)

    tracking_id = generate_tracking_id()

    # Sanitize PII data
    sanitized_data = sanitize_pii_data(payload.model_dump())
    logger.info("PII data sanitized for report", tracking_id=tracking_id)

    ai_result = analyze_report(sanitized_data)

    # Check AI risk assessment - require meaningful risk score
    ai_score = int(ai_result.get("risk_score", 0))
    if ai_score < 20:
        logger.warning("AI risk assessment failed", tracking_id=tracking_id, ai_score=ai_score)
        raise HTTPException(
            status_code=400,
            detail="This report does not contain sufficient evidence of a real incident. Please provide specific details about what happened, where, when, and who was involved."
        )

    # Create report with sanitized data
    report = Report(
        tracking_id=tracking_id,
        category=payload.category,
        description=payload.description,  # Keep original for display
        location=sanitized_data.get('location'),  # Use sanitized location
        region=payload.region,
        organization=payload.organization,
        incident_date=payload.incident_date,
        anonymous=payload.anonymous,
        danger_flag=payload.danger_flag,
        contact=sanitized_data.get('contact'),  # Use encrypted contact
        status=ReportStatus.AI_CHECKED,
        ai_score=ai_score,
        ai_result=json.dumps(ai_result, ensure_ascii=False),
        reward_status=ai_result.get("reward_potential", "not_eligible_yet"),
    )
    db.add(report)
    db.commit()
    db.refresh(report)

    add_timeline(db, report, ReportStatus.SUBMITTED, "Report submitted safely", "Your report was received by CleanSignal.")
    add_timeline(db, report, ReportStatus.AI_CHECKED, "AI structure check completed", "AI reviewed structure and risk signals. Human moderators make final decisions.")
    db.add(ModeratorMessage(report_id=report.id, sender="System", message="Your report is now ready for moderator review."))
    db.commit()
    db.refresh(report)

    loaded = db.query(Report).options(selectinload(Report.timeline), selectinload(Report.messages), selectinload(Report.evidence_files)).filter(Report.id == report.id).first()

    logger.info("Report created successfully", tracking_id=tracking_id, ai_score=ai_score)
    return {"tracking_id": tracking_id, "status": loaded.status, "ai_result": ai_result, "report": _report_to_out(loaded)}


@router.get("", response_model=list[ReportOut])
def list_reports(status: str | None = None, limit: int = 50, db: Session = Depends(get_db)):
    query = db.query(Report).options(selectinload(Report.timeline), selectinload(Report.messages), selectinload(Report.evidence_files))
    if status:
        query = query.filter(Report.status == status)
    reports = query.order_by(desc(Report.created_at)).limit(min(limit, 200)).all()
    return [_report_to_out(r) for r in reports]


@router.get("/track/{tracking_id}", response_model=ReportOut)
def track_report(tracking_id: str, db: Session = Depends(get_db)):
    report = db.query(Report).options(selectinload(Report.timeline), selectinload(Report.messages), selectinload(Report.evidence_files)).filter(Report.tracking_id == tracking_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Tracking ID not found")
    return _report_to_out(report)


@router.get("/{report_id}", response_model=ReportOut)
def get_report(report_id: int, db: Session = Depends(get_db)):
    report = db.query(Report).options(selectinload(Report.timeline), selectinload(Report.messages), selectinload(Report.evidence_files)).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return _report_to_out(report)


@router.patch("/{report_id}/status", response_model=ReportOut)
def update_status(
    report_id: int,
    payload: StatusUpdate,
    current_user: User = Depends(get_current_moderator_user),
    db: Session = Depends(get_db)
):
    """Update report status (moderator/admin only)."""
    logger.info("Status update attempt", report_id=report_id, new_status=payload.status, user=current_user.email)

    # Validate status enum
    try:
        new_status = ReportStatus(payload.status)
    except ValueError:
        allowed = [s.value for s in ReportStatus]
        raise HTTPException(status_code=400, detail=f"Invalid status. Allowed: {sorted(allowed)}")

    report = _load_report_or_404(db, report_id)
    old_status = report.status
    report.status = new_status
    report.updated_at = datetime.utcnow()

    add_timeline(
        db,
        report,
        new_status,
        new_status.value.replace("_", " ").title(),
        payload.message or f"Status changed from {old_status.value} to {new_status.value}.",
    )

    if payload.message:
        db.add(ModeratorMessage(report_id=report.id, sender=f"Moderator ({current_user.email})", message=payload.message))

    db.commit()

    loaded = db.query(Report).options(selectinload(Report.timeline), selectinload(Report.messages), selectinload(Report.evidence_files)).filter(Report.id == report_id).first()

    logger.info("Status updated successfully", report_id=report_id, old_status=old_status.value, new_status=new_status.value)
    return _report_to_out(loaded)


@router.post("/{report_id}/messages", response_model=ReportOut)
def add_message(report_id: int, payload: ModeratorMessageCreate, db: Session = Depends(get_db)):
    report = _load_report_or_404(db, report_id)
    db.add(ModeratorMessage(report_id=report.id, sender=payload.sender, message=payload.message))
    db.commit()
    loaded = db.query(Report).options(selectinload(Report.timeline), selectinload(Report.messages), selectinload(Report.evidence_files)).filter(Report.id == report_id).first()
    return _report_to_out(loaded)


@router.post("/{report_id}/evidence", response_model=ReportOut)
# @limiter.limit(FILE_UPLOAD_LIMIT)
async def upload_evidence(
    request: Request,
    report_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Upload evidence file with comprehensive security scanning."""
    logger.info("File upload attempt", report_id=report_id, filename=file.filename)

    report = _load_report_or_404(db, report_id)

    # Read file content
    content = await file.read()

    # Basic size check
    if len(content) > 25 * 1024 * 1024:  # 25MB
        logger.warning("File too large", report_id=report_id, size=len(content))
        raise HTTPException(status_code=413, detail="File too large. Max size is 25 MB.")

    # Save file temporarily for security scanning
    ensure_upload_dir(UPLOAD_DIR)
    temp_filename = secure_filename(file.filename or "evidence")
    temp_path = os.path.join(UPLOAD_DIR, f"temp_{temp_filename}")

    try:
        with open(temp_path, "wb") as f:
            f.write(content)

        # Comprehensive security validation
        is_secure, security_error = validate_file_security(file, temp_path)
        if not is_secure:
            logger.warning("File security check failed", report_id=report_id, error=security_error)
            raise HTTPException(status_code=400, detail=security_error)

        # Calculate secure hash
        file_hash = calculate_file_hash(temp_path)

        # Generate final secure filename
        _, ext = os.path.splitext(file.filename or "evidence")
        final_filename = f"{file_hash[:16]}{ext}"
        final_path = os.path.join(UPLOAD_DIR, final_filename)

        # Move file to final location
        os.rename(temp_path, final_path)

        # Create evidence record
        evidence = EvidenceFile(
            report_id=report.id,
            original_name=file.filename or "evidence",
            stored_name=final_filename,
            content_type=file.content_type,
            size_bytes=len(content),
            sha256=file_hash,
        )
        db.add(evidence)
        add_timeline(db, report, ReportStatus.EVIDENCE_UPLOADED, "Evidence uploaded", "A file was attached and scanned for security.")

        # Re-run AI after evidence arrives to improve evidence strength/reward potential.
        ai_result = analyze_report({
            "category": report.category,
            "description": report.description,
            "location": report.location,
            "region": report.region,
            "organization": report.organization,
            "incident_date": report.incident_date,
            "has_evidence": True,
            "anonymous": report.anonymous,
            "danger_flag": report.danger_flag,
        })
        report.ai_score = int(ai_result.get("risk_score", report.ai_score))
        report.ai_result = json.dumps(ai_result, ensure_ascii=False)
        report.reward_status = ai_result.get("reward_potential", report.reward_status)
        report.updated_at = datetime.utcnow()
        db.commit()

        loaded = db.query(Report).options(selectinload(Report.timeline), selectinload(Report.messages), selectinload(Report.evidence_files)).filter(Report.id == report_id).first()

        logger.info("File uploaded successfully", report_id=report_id, hash=file_hash)
        return _report_to_out(loaded)

    except Exception as e:
        # Clean up temp file if it exists
        if os.path.exists(temp_path):
            os.remove(temp_path)
        logger.error("File upload failed", report_id=report_id, error=str(e))
        raise
    finally:
        # Ensure temp file is cleaned up
        if os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except:
                pass
