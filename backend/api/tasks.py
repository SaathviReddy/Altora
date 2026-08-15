from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database.db import get_db
from backend.models.models import User, Task
from backend.schemas.schemas import TaskSchema, TaskCreate, StandardResponse
from backend.core.dependencies import get_current_user, standard_response
from backend.services.websocket_manager import manager

router = APIRouter(prefix="/tasks", tags=["Tasks"])

@router.get("", response_model=StandardResponse)
def get_tasks(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    tasks = db.query(Task).filter(Task.user_id == current_user.id).order_by(Task.created_at.desc()).all()
    task_list = [TaskSchema.model_validate(t).model_dump() for t in tasks]
    return standard_response(data=task_list)


@router.post("", response_model=StandardResponse)
async def add_task(
    req: TaskCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    task = Task(
        user_id=current_user.id,
        title=req.title,
        completed=False,
        due_date=req.dueDate
    )
    db.add(task)
    db.commit()
    db.refresh(task)

    task_dict = TaskSchema.model_validate(task).model_dump()

    await manager.broadcast_event(
        user_id=current_user.id,
        event_type="task",
        action="created",
        data=task_dict
    )

    return standard_response(data=task_dict)


@router.patch("/{task_id}/toggle", response_model=StandardResponse)
async def toggle_task(
    task_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    task = db.query(Task).filter(Task.id == task_id, Task.user_id == current_user.id).first()
    if not task:
        return standard_response(
            success=False,
            error={"code": "NOT_FOUND", "message": "Task not found."}
        )

    task.completed = not task.completed
    db.commit()
    db.refresh(task)

    task_dict = TaskSchema.model_validate(task).model_dump()

    await manager.broadcast_event(
        user_id=current_user.id,
        event_type="task",
        action="updated",
        data=task_dict
    )

    return standard_response(data=task_dict)
