from database.database_service import SessionDep, database_service
from fastapi import APIRouter, HTTPException
from sqlmodel import select, or_
from database.models import User, UserCreate, UserPublic
from auth.auth_service import AuthService, LoginRequest

auth_service = AuthService()

auth_router = APIRouter(prefix="/auth", tags=["Auth"])

@auth_router.post( "/login" )
def login( credentials: LoginRequest, session: SessionDep ):
    return auth_service.login_user(credentials, session)

@auth_router.post("/sign-up", response_model = UserPublic)
def sign_up(user: UserCreate, session: SessionDep ):
    return auth_service.register_user(user, session)