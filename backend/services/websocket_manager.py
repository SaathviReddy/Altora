import json
from typing import Dict, List, Set
from fastapi import WebSocket

class ConnectionManager:
    def __init__(self):
        # Map user_id to set of active WebSocket connections
        self.active_connections: Dict[str, Set[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = set()
        self.active_connections[user_id].add(websocket)

    def disconnect(self, websocket: WebSocket, user_id: str):
        if user_id in self.active_connections:
            self.active_connections[user_id].discard(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]

    async def send_personal_message(self, message: dict, user_id: str):
        if user_id in self.active_connections:
            data_str = json.dumps(message)
            for connection in list(self.active_connections[user_id]):
                try:
                    await connection.send_text(data_str)
                except Exception:
                    self.disconnect(connection, user_id)

    async def broadcast_event(self, user_id: str, event_type: str, action: str, data: dict):
        payload = {
            "type": event_type,
            "event": action,
            "data": data
        }
        await self.send_personal_message(payload, user_id)

manager = ConnectionManager()
