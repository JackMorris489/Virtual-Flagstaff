# token_service.py

import jwt
from datetime import datetime, timedelta, timezone

SECRET_KEY = "a589b61a65e041b84fe79687b6b6d705bf2a650b1464e8fe0ac8f91d8fd88f20"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 2

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + \
                                  timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt