import hashlib
import os
from pathlib import Path
from typing import Optional, Tuple
from cryptography.fernet import Fernet
from fastapi import HTTPException, UploadFile

try:
    import magic
    MAGIC_AVAILABLE = True
except ImportError:
    MAGIC_AVAILABLE = False

# File security settings
MAX_FILE_SIZE = 25 * 1024 * 1024  # 25MB
ALLOWED_CONTENT_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webp",
    "video/mp4",
    "audio/mpeg",
    "audio/wav",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}

# File extension to MIME type mapping
EXTENSION_TO_MIME = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.mp4': 'video/mp4',
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
}

# Dangerous file signatures (file magic signatures)
DANGEROUS_SIGNATURES = [
    b'\x4D\x5A',  # MZ (Windows executable)
    b'\x7F\x45\x4C\x46',  # ELF (Linux executable)
    b'\x23\x21',  # #! (Script files)
    b'\x50\x4B\x03\x04',  # ZIP/PK (could contain executables)
    b'\x52\x61\x72\x21',  # RAR
    b'\x1F\x8B',  # GZIP (could be compressed executable)
]

# Encryption key (should be in environment variables in production)
ENCRYPTION_KEY = os.getenv("ENCRYPTION_KEY", Fernet.generate_key())
cipher = Fernet(ENCRYPTION_KEY)


def get_file_magic_type(file_path: str) -> str:
    """Get file type using extension-based detection as fallback."""
    if MAGIC_AVAILABLE:
        try:
            return magic.from_file(file_path, mime=True)
        except Exception:
            pass

    # Fallback to extension-based detection
    _, ext = os.path.splitext(file_path.lower())
    return EXTENSION_TO_MIME.get(ext, "unknown")


def scan_file_for_malware(file_path: str) -> bool:
    """Basic malware scan by checking file signatures."""
    try:
        with open(file_path, 'rb') as f:
            header = f.read(4)  # Read first 4 bytes

        for signature in DANGEROUS_SIGNATURES:
            if header.startswith(signature):
                return True
        return False
    except Exception:
        return True  # If we can't read the file, consider it suspicious


def validate_file_security(upload_file: UploadFile, file_path: str) -> Tuple[bool, str]:
    """Comprehensive file security validation."""
    # Check file size
    if upload_file.size and upload_file.size > MAX_FILE_SIZE:
        return False, f"File too large. Maximum size is {MAX_FILE_SIZE // (1024*1024)}MB."

    # Get actual file type from content
    actual_mime = get_file_magic_type(file_path)

    # Check if declared content type matches actual content type
    if upload_file.content_type not in ALLOWED_CONTENT_TYPES:
        return False, f"Unsupported file type: {upload_file.content_type}"

    if actual_mime != upload_file.content_type:
        return False, f"File content type mismatch. Declared: {upload_file.content_type}, Actual: {actual_mime}"

    # Scan for malware signatures
    if scan_file_for_malware(file_path):
        return False, "File failed security scan. Potentially dangerous content detected."

    return True, ""


def calculate_file_hash(file_path: str) -> str:
    """Calculate SHA256 hash of file."""
    sha256 = hashlib.sha256()
    with open(file_path, 'rb') as f:
        for chunk in iter(lambda: f.read(4096), b""):
            sha256.update(chunk)
    return sha256.hexdigest()


def encrypt_data(data: str) -> str:
    """Encrypt sensitive data."""
    return cipher.encrypt(data.encode()).decode()


def decrypt_data(encrypted_data: str) -> str:
    """Decrypt sensitive data."""
    return cipher.decrypt(encrypted_data.encode()).decode()


def sanitize_pii_data(data: dict) -> dict:
    """Sanitize personally identifiable information."""
    sanitized = data.copy()

    # Encrypt email if present
    if 'contact' in sanitized and sanitized['contact']:
        sanitized['contact'] = encrypt_data(sanitized['contact'])

    # Remove or mask sensitive location data if too specific
    if 'location' in sanitized and sanitized['location']:
        # Basic PII minimization - could be enhanced
        location = sanitized['location']
        if len(location.split()) > 3:  # If location is too detailed
            # Keep only general area, mask specifics
            words = location.split()
            if len(words) > 2:
                sanitized['location'] = f"{words[0]} {words[1]} [REDACTED]"

    return sanitized


def secure_filename(filename: str) -> str:
    """Generate secure filename."""
    import secrets
    import string

    # Get file extension
    _, ext = os.path.splitext(filename)

    # Generate random filename
    random_name = ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(32))

    return f"{random_name}{ext}"