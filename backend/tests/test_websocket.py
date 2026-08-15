import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_websocket_connection():
    email = f"ws_user_{os.urandom(4).hex()}@example.com"
    signup_res = client.post(
        "/api/v1/auth/signup",
        json={"email": email, "name": "WS User", "password": "password123"}
    )
    token = signup_res.json()["data"]["token"]

    with client.websocket_connect(f"/ws?token={token}") as websocket:
        websocket.send_json({"type": "ping"})
        data = websocket.receive_json()
        assert data["type"] == "pong"
