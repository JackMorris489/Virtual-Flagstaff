from database.models import User, UserCreate
from database.database_service import database_service, SessionDep
from sqlmodel import select, or_
from fastapi import HTTPException

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