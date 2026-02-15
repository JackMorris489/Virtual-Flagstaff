from database.database_service import SessionDep, database_service
from fastapi import APIRouter, HTTPException
from sqlmodel import select, or_
from database.models import User

auth_router = APIRouter(prefix="/auth", tags=["Auth"])

@auth_router.post( "/login" )
def login( data: dict, session: SessionDep ):
    query = select(User).where(
        or_(
            User.email == data[ "identifier" ],
            User.phone_number == data[ "identifier" ]
        )
    )

    user = database_service.get_model_instance( session, query )
    if not user:
        raise HTTPException( 401, "Invalid credentials" )
    
    if not user.password == data[ "password" ]:
        raise HTTPException( 401, "Invalid credentials" )
    
    return { "detail": "Login successful"}