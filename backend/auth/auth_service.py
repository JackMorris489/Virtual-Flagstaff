# auth_service.py

from database.models import User, UserCreate
from database.database_service import database_service, SessionDep
from sqlmodel import select, or_
from fastapi import HTTPException
from pydantic import BaseModel
from pwdlib import PasswordHash
from auth.token import create_access_token, Token, ACCESS_TOKEN_EXPIRE_MINUTES
from datetime import timedelta

password_hash = PasswordHash.recommended()

class LoginRequest(BaseModel):
    username: str
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
        
        user_exists = database_service.get_query_result(dbSession, query)
        if user_exists:
            raise HTTPException(409, "User exists")
        
        user.password = password_hash.hash(user.password)
        return database_service.create_model_instance(User, dbSession, user)
    

    def login_user(
        self,
        credentials: LoginRequest,
        session: SessionDep
    ) -> Token:
        exception = HTTPException(401, "Invalid credentials")
        query = select(User).where(
            or_(
                User.username == credentials.username,
                User.email == credentials.username,
                User.phone_number == credentials.username
            )
        )

        user = database_service.get_query_result(session, query)
        if not user:
            raise exception

        if not password_hash.verify(credentials.password, user.password):
            raise exception

        return Token(
            access_token=create_access_token(
                {"sub": user.username},
                expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
            ),
            token_type="bearer"
        )