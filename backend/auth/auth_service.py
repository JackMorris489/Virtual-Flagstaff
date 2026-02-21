# auth_service.py

from database.models import User, UserCreate
from database.database_service import database_service, SessionDep
from sqlmodel import select, or_
from fastapi import HTTPException
from pydantic import BaseModel
from pwdlib import PasswordHash

password_hash = PasswordHash.recommended()

class LoginRequest(BaseModel):
    identifier: str
    password: str

class AuthService:
    def register_user(self, user: UserCreate, dbSession: SessionDep):
        identifier = user.email or user.phone_number
        query = select(User).where(
            or_(
                User.username == user.username,
                User.email == identifier,
                User.phone_number == identifier
            )
        )
        
        user_exists = database_service.get_model_instance(dbSession, query)
        if user_exists:
            raise HTTPException(409, "User exists")
        
        user.password = password_hash.hash(user.password)
        return database_service.create_model_instance(User, dbSession, user)
    

    def login_user(self, credentials: LoginRequest, session: SessionDep):
        query = select(User).where(
            or_(
                User.username == credentials.identifier,
                User.email == credentials.identifier,
                User.phone_number == credentials.identifier
            )
        )

        user = database_service.get_model_instance(session, query)
        if not user:
            raise HTTPException(401, "Invalid credentials")

        if not password_hash.verify(credentials.password, user.password):
            raise HTTPException(401, "Invalid credentials")

        return {"detail":"Success"}