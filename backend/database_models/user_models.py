# user_models.py

from sqlmodel import (
    Field, 
    SQLModel,
    Column
)
from sqlalchemy.dialects.postgresql import JSONB
from typing import Any
from pydantic import BaseModel

class UserBase( SQLModel ):
    username: str = Field( unique = True, index = True )
    
class User( UserBase, table = True ):
    id: int | None = Field( default = None, primary_key = True )
    password: str 
    email: str | None = Field( default = None, unique = True, index = True )
    phone_number: str | None = Field( default = None, 
                                      unique = True, 
                                      index = True )
    receive_notifications: bool = Field( default = False )
    survey: dict[ str, Any ] | None = Field( default = None, 
                                             sa_column = Column( JSONB ) )

class UserPublic( UserBase ):
    id: int

class UserCreate( UserBase ):
    password: str
    email: str | None = None
    phone_number: str | None = None
    receive_notifications: bool = False
    survey: dict[ str, Any ] | None = None

class UserUpdate( UserBase ):
    username: str | None = None
    email: str | None = None
    phone_number: str | None = None
    password: str | None = None
    receive_notifications: bool | None = None

class SurveySubmission(BaseModel):
    user_id: Optional[str] = None
    move_timing: str
    interests: List[str] = []
    amenities: List[str] = []
    budget: Optional[str] = None
    has_pets: Optional[bool] = None
    notes: Optional[str] = None