from fastapi import Depends, status, HTTPException
import jwt
from jwt.exceptions import InvalidTokenError
from constants import TOKEN_KEY
from typing import Annotated
from sqlmodel import select
from database import database_service, SessionDep
from database.models import User
from auth.token import oauth2_scheme, ALGORITHM, TokenData

async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    session: SessionDep
):
    exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"}
    )
    try:
        payload = jwt.decode(token, TOKEN_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if username is None:
            raise exception
        token_data = TokenData(username=username)
    except InvalidTokenError:
        raise exception
    query = select(User).where(User.username == token_data.username)
    user = database_service.get_query_result(session, query)
    return user

async def get_current_active_user(
    current_user: Annotated[User, Depends(get_current_user)]
):
    if current_user.disabled:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user