from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database.db import get_db
from backend.models.models import User
from backend.schemas.schemas import UserResponse, StandardResponse
from backend.core.dependencies import get_current_user, standard_response

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/me", response_model=StandardResponse)
def get_user_profile(current_user: User = Depends(get_current_user)):
    user_resp = UserResponse.model_validate(current_user).model_dump(by_alias=True)
    return standard_response(data=user_resp)

@router.put("/me", response_model=StandardResponse)
def update_user_profile(
    name: str = None,
    business_name: str = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if name is not None:
        current_user.name = name
    if business_name is not None:
        current_user.business_name = business_name

    db.commit()
    db.refresh(current_user)
    user_resp = UserResponse.model_validate(current_user).model_dump(by_alias=True)
    return standard_response(data=user_resp)
