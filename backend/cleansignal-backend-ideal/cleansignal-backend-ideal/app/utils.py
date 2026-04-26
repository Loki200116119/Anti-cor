import hashlib
import os
import uuid
from datetime import datetime
from pathlib import Path


def generate_tracking_id() -> str:
    date_part = datetime.utcnow().strftime("%Y%m%d")
    random_part = str(uuid.uuid4().int)[0:6]
    return f"CS-{date_part}-{random_part}"


def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def safe_filename(filename: str) -> str:
    suffix = Path(filename).suffix.lower()[:20]
    return f"{uuid.uuid4().hex}{suffix}"


def ensure_upload_dir(path: str) -> None:
    os.makedirs(path, exist_ok=True)
