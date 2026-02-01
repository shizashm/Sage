"""Auth schemas."""
from datetime import date
from typing import Literal

from pydantic import BaseModel, EmailStr
from uuid import UUID


class SignupRequest(BaseModel):
    email: EmailStr
    password: str
    name: str | None = None
    role: Literal["client", "therapist"] = "client"
    date_of_birth: date | None = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: UUID
    email: str
    name: str | None = None
    role: str = "client"
    date_of_birth: date | None = None

    class Config:
        from_attributes = True


class AuthResponse(BaseModel):
    user_id: UUID
    session_id: UUID
    user: UserResponse | None = None
