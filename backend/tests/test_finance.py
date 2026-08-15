import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def get_auth_token():
    email = f"finance_user_{os.urandom(4).hex()}@example.com"
    res = client.post(
        "/api/v1/auth/signup",
        json={"email": email, "name": "Finance User", "password": "password123"}
    )
    return res.json()["data"]["token"]

def test_finance_flow():
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}

    # Add Revenue
    rev_res = client.post(
        "/api/v1/finance/transactions",
        headers=headers,
        json={
            "amount": 5000.0,
            "type": "revenue",
            "category": "Consulting",
            "description": "Retainer Payment 1"
        }
    )
    assert rev_res.status_code == 200

    # Add Expense
    exp_res = client.post(
        "/api/v1/finance/transactions",
        headers=headers,
        json={
            "amount": 1200.0,
            "type": "expense",
            "category": "Software",
            "description": "Hosting Services"
        }
    )
    assert exp_res.status_code == 200

    # Check Summary
    sum_res = client.get("/api/v1/finance/summary", headers=headers)
    assert sum_res.status_code == 200
    summary = sum_res.json()["data"]
    assert summary["revenue"] == 5000.0
    assert summary["expenses"] == 1200.0
    assert summary["profit"] == 3800.0
