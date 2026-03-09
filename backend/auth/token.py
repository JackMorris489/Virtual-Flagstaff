import jwt
from pydantic import BaseModel
from datetime import datetime, timezone, timedelta
from constants import TOKEN_KEY
from fastapi.security import OAuth2PasswordBearer

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

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
    return encoded_jwt