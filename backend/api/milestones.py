from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from backend.database.db import get_db
from backend.models.models import User, Milestone, Memory
from backend.schemas.schemas import MilestoneSchema, MilestoneCreate, StandardResponse
from backend.core.dependencies import get_current_user, standard_response
from backend.services.websocket_manager import manager

router = APIRouter(prefix="/milestones", tags=["Milestones"])

@router.get("", response_model=StandardResponse)
def get_milestones(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    milestones = db.query(Milestone).filter(Milestone.user_id == current_user.id).order_by(Milestone.date.asc()).all()
    ms_list = [MilestoneSchema.model_validate(m).model_dump() for m in milestones]
    return standard_response(data=ms_list)


@router.post("", response_model=StandardResponse)
async def add_milestone(
    req: MilestoneCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    ms = Milestone(
        user_id=current_user.id,
        title=req.title,
        description=req.description,
        date=req.date,
        completed=False
    )
    db.add(ms)

    # Auto memory log
    mem = Memory(
        user_id=current_user.id,
        title=f"Scheduled Milestone: {req.title}",
        category="Milestones",
        content=req.description,
        timestamp=datetime.now(timezone.utc).isoformat()
    )
    db.add(mem)

    db.commit()
    db.refresh(ms)

    ms_dict = MilestoneSchema.model_validate(ms).model_dump()

    await manager.broadcast_event(
        user_id=current_user.id,
        event_type="milestone",
        action="created",
        data=ms_dict
    )

    return standard_response(data=ms_dict)


@router.patch("/{milestone_id}/toggle", response_model=StandardResponse)
async def toggle_milestone(
    milestone_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    ms = db.query(Milestone).filter(Milestone.id == milestone_id, Milestone.user_id == current_user.id).first()
    if not ms:
        return standard_response(
            success=False,
            error={"code": "NOT_FOUND", "message": "Milestone not found."}
        )

    ms.completed = not ms.completed
    if ms.completed:
        mem = Memory(
            user_id=current_user.id,
            title=f"Completed Milestone: {ms.title}",
            category="Milestones",
            content=ms.description,
            timestamp=datetime.now(timezone.utc).isoformat()
        )
        db.add(mem)

    db.commit()
    db.refresh(ms)

    ms_dict = MilestoneSchema.model_validate(ms).model_dump()

    await manager.broadcast_event(
        user_id=current_user.id,
        event_type="milestone",
        action="updated",
        data=ms_dict
    )

    return standard_response(data=ms_dict)
