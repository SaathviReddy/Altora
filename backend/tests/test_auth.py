import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    json_data = response.json()
    assert json_data["success"] is True
    assert json_data["data"]["status"] == "healthy"

def test_signup_and_login():
    email = f"test_founder_{os.urandom(4).hex()}@example.com"
    # Signup
    signup_res = client.post(
        "/api/v1/auth/signup",
        json={"email": email, "name": "Test Founder", "password": "password123"}
    )
    assert signup_res.status_code == 200
    res_data = signup_res.json()
    assert res_data["success"] is True
    assert "token" in res_data["data"]
    token = res_data["data"]["token"]

    # Get Me
    me_res = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert me_res.status_code == 200
    me_data = me_res.json()
    assert me_data["success"] is True
    assert me_data["data"]["email"] == email

    # Login
    login_res = client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": "password123"}
    )
    assert login_res.status_code == 200
    login_data = login_res.json()
    assert login_data["success"] is True
    assert "token" in login_data["data"]

def test_unauthorized_access():
    res = client.get("/api/v1/auth/me")
    assert res.status_code == 401
