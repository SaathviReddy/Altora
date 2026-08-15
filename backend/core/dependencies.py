from typing import Optional, Dict, Any
from fastapi import Depends, HTTPException, status, Query
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from backend.database.db import get_db
from backend.core.security import decode_access_token
from backend.models.models import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)

def get_current_user(
    token_header: Optional[str] = Depends(oauth2_scheme),
    token_query: Optional[str] = Query(None, alias="token"),
    db: Session = Depends(get_db)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    token = token_header or token_query
    if not token:
        raise credentials_exception

    user_id = decode_access_token(token)
    if not user_id:
        raise credentials_exception

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise credentials_exception

    return user

def standard_response(data: Any = None, success: bool = True, error: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    return {
        "success": success,
        "data": data,
        "error": error
    }
