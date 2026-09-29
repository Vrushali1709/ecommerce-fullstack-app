from typing import Generator, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, HTTPBearer, HTTPAuthorizationCredentials
import jwt
from pydantic import ValidationError
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.database import get_db
from app.models.user import User
from app.schemas.user import TokenPayload

security = HTTPBearer(auto_error=False)


def get_current_user(
    db: Session = Depends(get_db),
    auth_header: Optional[HTTPAuthorizationCredentials] = Depends(security),
) -> User:
    """Dependency that returns the currently authenticated user from Bearer JWT token."""
    if not auth_header:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = auth_header.credentials
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        token_data = TokenPayload(**payload)
    except (jwt.PyJWTError, ValidationError):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Could not validate credentials",
        )
    user = db.query(User).filter(User.id == token_data.sub).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return user


def get_current_user_optional(
    db: Session = Depends(get_db),
    auth_header: Optional[HTTPAuthorizationCredentials] = Depends(security),
) -> Optional[User]:
    """Dependency that returns user if authenticated, or None if guest."""
    if not auth_header:
        return None
    token = auth_header.credentials
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        token_data = TokenPayload(**payload)
        user = db.query(User).filter(User.id == token_data.sub).first()
        if user and user.is_active:
            return user
    except Exception:
        return None
    return None


def get_current_admin_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """Dependency that verifies current user is an admin."""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required",
        )
    return current_user
