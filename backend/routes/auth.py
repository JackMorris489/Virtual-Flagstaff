from database.database_service import SessionDep
from fastapi import APIRouter
from database.models import UserCreate, UserPublic
from auth.auth_service import AuthService, LoginRequest
from auth.token import Token

ROUTER_PREFIX = "/auth"

auth_service = AuthService()

auth_router = APIRouter(prefix=ROUTER_PREFIX, tags=["Auth"])

@auth_router.post("/login", response_model=Token)
async def login(
    credentials: LoginRequest,
    session: SessionDep
) -> Token:
    return auth_service.login_user(credentials, session)

@auth_router.post("/sign-up", response_model=UserPublic, status_code=201)
def sign_up(user: UserCreate, session: SessionDep):
    return auth_service.register_user(user, session)