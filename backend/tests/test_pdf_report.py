import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def get_auth_token():
    email = f"pdf_user_{os.urandom(4).hex()}@example.com"
    res = client.post(
        "/api/v1/auth/signup",
        json={"email": email, "name": "PDF Test User", "password": "password123"}
    )
    return res.json()["data"]["token"]

def test_pdf_report_generation_and_download():
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Post Query to Generate Report
    query = "I want to start a cupcake business"
    report_res = client.post(
        "/api/v1/advisor/report",
        headers=headers,
        json={"query": query}
    )
    assert report_res.status_code == 200
    res_data = report_res.json()
    assert res_data["success"] is True
    report = res_data["data"]
    assert "id" in report
    report_id = report["id"]

    # 2. Download / Preview PDF Stream
    pdf_res = client.get(f"/api/v1/advisor/reports/{report_id}/pdf", headers=headers)
    assert pdf_res.status_code == 200
    assert pdf_res.headers["content-type"] == "application/pdf"
    
    # Confirm it is a REAL PDF (starts with %PDF- header)
    content_bytes = pdf_res.content
    assert content_bytes.startswith(b"%PDF-")
    assert len(content_bytes) > 500  # Non-trivial PDF document size
