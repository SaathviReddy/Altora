from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database.db import get_db
from backend.models.models import User, Notification
from backend.schemas.schemas import StandardResponse
from backend.core.dependencies import get_current_user, standard_response

router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.get("", response_model=StandardResponse)
def get_notifications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    notifications = db.query(Notification).filter(Notification.user_id == current_user.id).order_by(Notification.created_at.desc()).all()
    notif_list = [
        {
            "id": n.id,
            "title": n.title,
            "message": n.message,
            "read": n.read,
            "createdAt": n.created_at.isoformat()
        }
        for n in notifications
    ]
    return standard_response(data=notif_list)


@router.patch("/{notification_id}/read", response_model=StandardResponse)
def mark_as_read(
    notification_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    notif = db.query(Notification).filter(Notification.id == notification_id, Notification.user_id == current_user.id).first()
    if notif:
        notif.read = True
        db.commit()
    return standard_response(data={"id": notification_id, "read": True})
