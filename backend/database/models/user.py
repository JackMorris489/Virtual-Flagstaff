# user.py

from sqlmodel import Field, SQLModel, Column
from sqlalchemy.dialects.postgresql import JSONB
from typing import Any

class UserBase(SQLModel):
    username: str = Field(unique=True, index=True)
    
class User(UserBase, table=True):
    id: int | None = Field(default=None, primary_key=True)
    password: str 
    email: str | None = Field(default=None, unique=True, index=True)
    phone_number: str | None = Field(default=None, unique=True, index=True)
    receive_notifications: bool = Field(default=False)
    survey: dict[str, Any] | None = Field(default=None, sa_column=Column(JSONB))
    completed_tutorial: bool
    points: int = 0
    is_admin: bool = False

class UserPublic(UserBase):
    id: int
    completed_tutorial: bool
    points: int
    is_admin: bool

class UserCreate(UserBase):
    password: str
    email: str | None = None
    phone_number: str | None = None
    receive_notifications: bool = False
    completed_tutorial: bool = False

class UserUpdate(UserBase):
    username: str | None = None
    email: str | None = None
    phone_number: str | None = None
    password: str | None = None
    receive_notifications: bool | None = None
    survey: dict[str, Any] | None = None
    completed_tutorial: bool | None = None
    points: int | None = None