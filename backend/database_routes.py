# database_routes.py

from database_models.user_models import (
    User, 
    UserCreate, 
    UserPublic, 
    UserUpdate,
    # SurveySubmission
)
from database_utilities import ( SessionDep,
    database_service
)
from fastapi import APIRouter, BackgroundTasks, HTTPException
from email_utilities import EmailService
from constants import MAIL_TO
from sqlmodel import select, or_, and_

email_service = EmailService()

database_router = APIRouter()

@database_router.post( "/user", response_model = UserPublic )
def create_user(
    user: UserCreate, 
    session: SessionDep
) -> UserPublic:
    return database_service.create_model_instance( User, session, user )


@database_router.get( "/users", response_model = list[ UserPublic ] )
def read_users( session: SessionDep ):
    return database_service.get_model_instances( User, session )


@database_router.get( "/user/{user_id}", response_model = UserPublic )
def read_user( user_id: int, session: SessionDep ):
    return database_service.get_model_instance_by_id( User, session, user_id )


@database_router.patch( "/user/{user_id}", response_model = UserPublic )
def update_user( background_tasks: BackgroundTasks, user_id: int, user: UserUpdate, session: SessionDep ):
    if user.survey is not None:
        user_db = database_service.get_model_instance_by_id( User, session, user_id )
        email_service.notify_client_of_new_user( 
            background_tasks,
            user_db.username, 
            user_db.email or user_db.phone_number, 
            user.survey
        )
    return database_service.set_model_instance_by_id( User, session, user_id, user )


@database_router.delete( "/user/{user_id}" )
def delete_user( user_id: int, session: SessionDep ):
    return database_service.delete_model_instance( User, session, user_id )


@database_router.post( "/login" )
def login( data: dict, session: SessionDep ):
    query = select(User).where(
        or_(
            User.email == data[ "identifier" ],
            User.phone_number == data[ "identifier" ]
        )
    )

    user = database_service.get_model_instance( User, session, query )
    print( user )
    if not user:
        raise HTTPException( 401, "Invalid credentials" )
    
    if not user.password == data[ "password" ]:
        raise HTTPException( 401, "Invalid credentials" )
    
    return { "detail": "Login successful"}