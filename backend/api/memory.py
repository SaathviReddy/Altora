from typing import Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from backend.database.db import get_db
from backend.models.models import User, Memory
from backend.schemas.schemas import MemorySchema, MemoryCreate, StandardResponse
from backend.core.dependencies import get_current_user, standard_response
from backend.services.websocket_manager import manager

router = APIRouter(prefix="/memory", tags=["Memory"])

@router.get("", response_model=StandardResponse)
def get_memories(
    category: Optional[str] = Query(None),
    q: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Memory).filter(Memory.user_id == current_user.id)
    if category and category != "All":
        query = query.filter(Memory.category == category)
    if q:
        query = query.filter(
            (Memory.title.ilike(f"%{q}%")) | (Memory.content.ilike(f"%{q}%"))
        )

    memories = query.order_by(Memory.created_at.desc()).all()
    mem_list = [MemorySchema.model_validate(m).model_dump() for m in memories]
    return standard_response(data=mem_list)


@router.post("", response_model=StandardResponse)
async def create_memory(
    req: MemoryCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    memory = Memory(
        user_id=current_user.id,
        title=req.title,
        category=req.category,
        content=req.content,
        timestamp=datetime.now(timezone.utc).isoformat(),
        related_context=req.relatedContext
    )
    db.add(memory)
    db.commit()
    db.refresh(memory)

    mem_dict = MemorySchema.model_validate(memory).model_dump()

    # Real-time WebSocket event emission
    await manager.broadcast_event(
        user_id=current_user.id,
        event_type="memory",
        action="created",
        data=mem_dict
    )

    return standard_response(data=mem_dict)


@router.delete("/{memory_id}", response_model=StandardResponse)
async def delete_memory(
    memory_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    memory = db.query(Memory).filter(Memory.id == memory_id, Memory.user_id == current_user.id).first()
    if not memory:
        return standard_response(
            success=False,
            error={"code": "NOT_FOUND", "message": "Memory not found."}
        )

    db.delete(memory)
    db.commit()

    await manager.broadcast_event(
        user_id=current_user.id,
        event_type="memory",
        action="deleted",
        data={"id": memory_id}
    )

    return standard_response(data={"id": memory_id})
