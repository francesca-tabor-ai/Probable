"""Auth schemas for sign up and log in."""

from pydantic import BaseModel, EmailStr, Field


class UserCreate(BaseModel):
    """Sign up request."""

    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)
    full_name: str | None = None


class UserLogin(BaseModel):
    """Log in request."""

    email: EmailStr
    password: str


class UserResponse(BaseModel):
    """User in API responses (no password)."""

    id: int
    email: str
    full_name: str | None
    is_active: bool

    model_config = {"from_attributes": True}


class Token(BaseModel):
    """JWT token response."""

    access_token: str
    token_type: str = "bearer"


class TokenPayload(BaseModel):
    """Decoded JWT payload."""

    sub: str
    exp: int
    iat: int
