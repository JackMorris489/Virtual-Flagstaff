import jwt
from pydantic import BaseModel
from datetime import datetime, timezone, timedelta
from constants import TOKEN_KEY
from fastapi import HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer, OAuth2
from fastapi.openapi.models import OAuthFlows
from fastapi.security.utils import get_authorization_scheme_param
from typing import Optional

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

class OAuth2PasswordBearerWithCookie(OAuth2):
    def __init__(
        self,
        tokenUrl: str,
        scheme_name: Optional[str] = None,
        scopes: Optional[dict[str, str]] = None,
        auto_error: bool = True,
    ):
        if not scopes:
            scopes = {}
        flows = OAuthFlows(password={"tokenUrl": tokenUrl, "scopes": scopes})
        super().__init__(flows=flows, scheme_name=scheme_name, auto_error=auto_error)

    async def __call__(self, request: Request) -> Optional[str]:
        print("COOKIES:", request.cookies)
        authorization: str = request.cookies.get("access_token")  #changed to accept access token from httpOnly Cookie
        print("access_token is",authorization)

        scheme, param = get_authorization_scheme_param(authorization)

        print("SCHEME:", scheme)
        print("TOKEN:", param)

        if not authorization or scheme.lower() != "bearer":
            if self.auto_error:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Not authenticated",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            else:
                return None
        return param

oauth2_scheme = OAuth2PasswordBearerWithCookie(tokenUrl="/auth/login")

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: str | None = None

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    if not TOKEN_KEY:
        raise RuntimeError("TOKEN_KEY environment variable not set.")
    encoded_jwt = jwt.encode(to_encode, TOKEN_KEY, algorithm=ALGORITHM)



    if isinstance(encoded_jwt, bytes):
        encoded_jwt = encoded_jwt.decode("utf-8")



        
    return encoded_jwt