import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def get_auth_token():
    email = f"memory_user_{os.urandom(4).hex()}@example.com"
    res = client.post(
        "/api/v1/auth/signup",
        json={"email": email, "name": "Memory User", "password": "password123"}
    )
    return res.json()["data"]["token"]

def test_memory_crud():
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Get empty memory list
    get_res = client.get("/api/v1/memory", headers=headers)
    assert get_res.status_code == 200
    assert get_res.json()["success"] is True

    # 2. Create Memory
    create_res = client.post(
        "/api/v1/memory",
        headers=headers,
        json={
            "title": "Initial Pivot Decision",
            "category": "Decisions",
            "content": "Pivoted service model to B2B retainers."
        }
    )
    assert create_res.status_code == 200
    mem_data = create_res.json()["data"]
    assert mem_data["title"] == "Initial Pivot Decision"
    memory_id = mem_data["id"]

    # 3. Read Memory list (should contain created memory)
    list_res = client.get("/api/v1/memory", headers=headers)
    assert list_res.status_code == 200
    items = list_res.json()["data"]
    assert len(items) == 1
    assert items[0]["id"] == memory_id

    # 4. Delete Memory
    del_res = client.delete(f"/api/v1/memory/{memory_id}", headers=headers)
    assert del_res.status_code == 200
    assert del_res.json()["success"] is True

    # 5. Verify deleted
    list_res_2 = client.get("/api/v1/memory", headers=headers)
    assert len(list_res_2.json()["data"]) == 0
