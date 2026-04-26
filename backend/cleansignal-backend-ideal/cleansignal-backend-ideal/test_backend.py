import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.main import app
from app.models import User
from app.auth import get_password_hash

# Test database setup
TEST_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)


def override_get_db():
    """Override database dependency for testing."""
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)


@pytest.fixture(scope="function")
def test_db():
    """Create a fresh database for each test."""
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def test_admin_user(test_db):
    """Create a test admin user."""
    admin_user = User(
        email="admin@test.com",
        hashed_password=get_password_hash("adminpass123"),
        role="admin",
        is_active=True
    )
    test_db.add(admin_user)
    test_db.commit()
    test_db.refresh(admin_user)
    return admin_user


@pytest.fixture(scope="function")
def auth_headers(test_admin_user):
    """Get authentication headers for admin user."""
    response = client.post(
        "/auth/login",
        data={"username": "admin@test.com", "password": "adminpass123"}
    )
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


class TestAuthentication:
    """Test authentication endpoints."""

    def test_register_user(self, test_db):
        """Test user registration."""
        user_data = {
            "email": "test@example.com",
            "password": "testpass123",
            "role": "user"
        }
        response = client.post("/auth/register", json=user_data)
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == "test@example.com"
        assert data["role"] == "user"

    def test_login_success(self, test_admin_user):
        """Test successful login."""
        response = client.post(
            "/auth/login",
            data={"username": "admin@test.com", "password": "adminpass123"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"

    def test_login_failure(self):
        """Test login with wrong credentials."""
        response = client.post(
            "/auth/login",
            data={"username": "wrong@email.com", "password": "wrongpass"}
        )
        assert response.status_code == 401

    def test_get_current_user(self, auth_headers):
        """Test getting current user info."""
        response = client.get("/auth/me", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == "admin@test.com"
        assert data["role"] == "admin"


class TestReports:
    """Test report endpoints."""

    def test_create_report_success(self):
        """Test successful report creation."""
        report_data = {
            "category": "corruption",
            "description": "This is a detailed description of corruption incident with at least 10 words to pass validation and provide meaningful information about what happened.",
            "region": "Tashkent",
            "anonymous": True
        }
        response = client.post("/reports", json=report_data)
        assert response.status_code == 200
        data = response.json()
        assert "tracking_id" in data
        assert "report" in data
        assert data["report"]["category"] == "corruption"

    def test_create_report_validation_failure(self):
        """Test report creation with validation failure."""
        # Test with too few words
        report_data = {
            "category": "corruption",
            "description": "Too short",
            "region": "Tashkent"
        }
        response = client.post("/reports", json=report_data)
        assert response.status_code == 400
        assert "at least 10 words" in response.json()["detail"]

    def test_create_report_missing_category(self):
        """Test report creation without required category."""
        report_data = {
            "description": "This is a detailed description of corruption incident with at least 10 words to pass validation and provide meaningful information about what happened.",
            "region": "Tashkent"
        }
        response = client.post("/reports", json=report_data)
        assert response.status_code == 422  # Pydantic validation error

    def test_list_reports(self):
        """Test listing reports."""
        response = client.get("/reports")
        assert response.status_code == 200
        assert isinstance(response.json(), list)

    def test_get_nonexistent_report(self):
        """Test getting a report that doesn't exist."""
        response = client.get("/reports/99999")
        assert response.status_code == 404

    def test_update_status_unauthorized(self):
        """Test updating status without authentication."""
        # First create a report
        report_data = {
            "category": "corruption",
            "description": "This is a detailed description of corruption incident with at least 10 words to pass validation and provide meaningful information about what happened.",
            "region": "Tashkent"
        }
        create_response = client.post("/reports", json=report_data)
        report_id = create_response.json()["report"]["id"]

        # Try to update status without auth
        update_data = {"status": "MODERATOR_REVIEWING"}
        response = client.patch(f"/reports/{report_id}/status", json=update_data)
        assert response.status_code == 401

    def test_update_status_authorized(self, auth_headers):
        """Test updating status with authentication."""
        # First create a report
        report_data = {
            "category": "corruption",
            "description": "This is a detailed description of corruption incident with at least 10 words to pass validation and provide meaningful information about what happened.",
            "region": "Tashkent"
        }
        create_response = client.post("/reports", json=report_data)
        report_id = create_response.json()["report"]["id"]

        # Update status with auth
        update_data = {"status": "MODERATOR_REVIEWING", "message": "Under review"}
        response = client.patch(f"/reports/{report_id}/status", json=update_data, headers=auth_headers)
        assert response.status_code == 200
        assert response.json()["status"] == "MODERATOR_REVIEWING"


class TestRateLimiting:
    """Test rate limiting functionality."""

    def test_report_creation_rate_limit(self):
        """Test that report creation is rate limited."""
        report_data = {
            "category": "corruption",
            "description": "This is a detailed description of corruption incident with at least 10 words to pass validation and provide meaningful information about what happened.",
            "region": "Tashkent"
        }

        # Make multiple requests quickly
        responses = []
        for _ in range(10):  # Exceed the 5/minute limit
            response = client.post("/reports", json=report_data)
            responses.append(response.status_code)

        # Should have some rate limited responses (429)
        assert 429 in responses


class TestHealth:
    """Test health and system endpoints."""

    def test_health_check(self):
        """Test health check endpoint."""
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        assert "version" in data

    def test_root_endpoint(self):
        """Test root endpoint."""
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert "CleanSignal Backend" in data["message"]
        assert "features" in data


class TestFileUpload:
    """Test file upload functionality."""

    def test_upload_invalid_file_type(self):
        """Test uploading invalid file type."""
        # First create a report
        report_data = {
            "category": "corruption",
            "description": "This is a detailed description of corruption incident with at least 10 words to pass validation and provide meaningful information about what happened.",
            "region": "Tashkent"
        }
        create_response = client.post("/reports", json=report_data)
        report_id = create_response.json()["report"]["id"]

        # Try to upload invalid file
        files = {"file": ("test.exe", b"fake executable content", "application/octet-stream")}
        response = client.post(f"/reports/{report_id}/evidence", files=files)
        assert response.status_code == 400

    def test_upload_oversized_file(self):
        """Test uploading file that's too large."""
        # First create a report
        report_data = {
            "category": "corruption",
            "description": "This is a detailed description of corruption incident with at least 10 words to pass validation and provide meaningful information about what happened.",
            "region": "Tashkent"
        }
        create_response = client.post("/reports", json=report_data)
        report_id = create_response.json()["report"]["id"]

        # Create oversized content (26MB)
        oversized_content = b"x" * (26 * 1024 * 1024)
        files = {"file": ("large.pdf", oversized_content, "application/pdf")}
        response = client.post(f"/reports/{report_id}/evidence", files=files)
        assert response.status_code == 413


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
