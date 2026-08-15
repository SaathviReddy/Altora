import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def get_auth_token():
    email = f"advisor_user_{os.urandom(4).hex()}@example.com"
    res = client.post(
        "/api/v1/auth/signup",
        json={"email": email, "name": "Advisor User", "password": "password123"}
    )
    return res.json()["data"]["token"]

def test_advisor_report_generation():
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}

    # Generate Report
    gen_res = client.post("/api/v1/advisor/generate", headers=headers)
    assert gen_res.status_code == 200
    res_json = gen_res.json()
    assert res_json["success"] is True
    report = res_json["data"]
    assert "id" in report
    assert "swot" in report
    assert "roadmap" in report
    report_id = report["id"]

    # Save to Memory
    save_res = client.post(f"/api/v1/advisor/reports/{report_id}/save-to-memory", headers=headers)
    assert save_res.status_code == 200
    assert save_res.json()["success"] is True

    # Check Memory
    mem_res = client.get("/api/v1/memory?category=Advisor Reports", headers=headers)
    assert mem_res.status_code == 200
    mems = mem_res.json()["data"]
    assert len(mems) >= 1
