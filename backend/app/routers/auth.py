from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User
from ..schemas import UserLogin, Token, UserResponse
from ..services.auth import verify_password, create_access_token, get_current_user

router = APIRouter(tags=["Authentication"])

@router.post("/admin/login", response_model=Token)
def admin_login(login_data: UserLogin, db: Session = Depends(get_db)):
    """Authenticate administrator and return JWT token."""
    user = db.query(User).filter(User.email == login_data.email.strip().lower()).first()
    if not user or not verify_password(login_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Account is deactivated")

    if user.role not in ("scheme_admin", "platform_admin"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied. Administrator role required.")

    access_token = create_access_token(data={"sub": user.email, "role": user.role, "id": user.id})
    return Token(
        access_token=access_token,
        token_type="bearer",
        role=user.role,
        email=user.email
    )

@router.get("/admin/me", response_model=UserResponse)
def get_current_admin(current_user: User = Depends(get_current_user)):
    """Get current signed-in administrator information."""
    return current_user
