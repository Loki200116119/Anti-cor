    #!/usr/bin/env python3
"""Simple test runner for CleanSignal backend."""

import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

def run_basic_tests():
    """Run basic functionality tests."""
    print("Running CleanSignal Backend Tests...")

    try:
        from fastapi.testclient import TestClient
        from app.main import app

        client = TestClient(app)

        # Test health
        response = client.get("/health")
        assert response.status_code == 200
        print("✓ Health check test passed")

        # Test root
        response = client.get("/")
        assert response.status_code == 200
        print("✓ Root endpoint test passed")

        # Test report creation validation
        report_data = {
            "category": "corruption",
            "description": "This is a detailed description of corruption incident with at least 10 words to pass validation and provide meaningful information about what happened.",
            "region": "Tashkent"
        }
        response = client.post("/reports", json=report_data)
        assert response.status_code == 200
        print("✓ Report creation test passed")

        # Test invalid report
        invalid_data = {
            "category": "corruption",
            "description": "Too short",
            "region": "Tashkent"
        }
        response = client.post("/reports", json=invalid_data)
        assert response.status_code == 422
        print("✓ Report validation test passed")

        print("\n🎉 All basic tests passed!")

    except Exception as e:
        print(f"❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    run_basic_tests()