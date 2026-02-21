from database.models import User, UserCreate
from database.database_service import database_service, SessionDep
from sqlmodel import select, or_
from fastapi import HTTPException
from pydantic import BaseModel

class LoginRequest(BaseModel):
    identifier: str
    password: str

class AuthService:
    def register_user(self, user: UserCreate, dbSession: SessionDep):
        email = user.email
        phone_number = user.phone_number
        query = select(User).where(
            or_(
                User.email == email,
                User.phone_number == phone_number
            )
        )

        user_exists = database_service.get_model_instance(dbSession, query)
        if user_exists:
            raise HTTPException(409, "User exists")
        
        return database_service.create_model_instance(User, dbSession, user)
    
    def login_user(self, credentials: LoginRequest, session: SessionDep):
        query = select(User).where(
            or_(
                User.email == credentials.identifier,
                User.phone_number == credentials.identifier
            )
        )

        user = database_service.get_model_instance( session, query )
        if not user:
            raise HTTPException( 401, "Invalid credentials" )

        if not user.password == credentials.password:
            raise HTTPException( 401, "Invalid credentials" )

        return {"detail": "Login successful"}