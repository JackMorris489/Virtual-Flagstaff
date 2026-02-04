# database_models.py

from sqlmodel import (
    Field, 
    SQLModel
)

class UserBase( SQLModel ):
    username: str = Field( unique = True, index = True )
    
class User( UserBase, table = True ):
    id: int | None = Field( default = None, primary_key = True )
    password: str 
    email: str | None = Field( default = None, unique = True, index = True )
    phone_number: str | None = Field( default = None, unique = True, index = True )
    receive_notifications: bool = Field( default = False )

class UserPublic( UserBase ):
    id: int

class UserCreate( UserBase ):
    password: str
    email: str | None = None
    phone_number: str | None = None
    receive_notifications: bool = False

class UserUpdate( UserBase ):
    username: str | None = None
    email: str | None = None
    phone_number: str | None = None
    password: str | None = None
    receive_notifications: bool | None = None