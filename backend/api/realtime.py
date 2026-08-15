import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from backend.core.security import decode_access_token
from backend.services.websocket_manager import manager

router = APIRouter(tags=["Realtime WebSockets"])

@router.websocket("/ws")
async def websocket_endpoint(
    websocket: WebSocket,
    token: str = Query(None)
):
    user_id = None
    if token:
        user_id = decode_access_token(token)

    if not user_id:
        # Close unauthenticated connections
        await websocket.close(code=4001, reason="Unauthorized")
        return

    await manager.connect(websocket, user_id)
    try:
        while True:
            data_str = await websocket.receive_text()
            try:
                msg = json.loads(data_str)
                # Handle ping/pong or client action requests
                if msg.get("type") == "ping":
                    await websocket.send_text(json.dumps({"type": "pong"}))
            except Exception:
                pass
    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id)
