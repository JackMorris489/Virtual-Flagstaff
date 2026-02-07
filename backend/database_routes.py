# database_routes.py

from database_models.user_models import (
    User, 
    UserCreate, 
    UserPublic, 
    UserUpdate
)
from database_utilities import ( SessionDep,
    database_service
)
from fastapi import APIRouter, BackgroundTasks
from email_utilities import EmailService
from constants import MAIL_TO

email_service = EmailService()

database_router = APIRouter()

@database_router.post( "/user", response_model = UserPublic )
def create_user( background_tasks: BackgroundTasks, user: UserCreate, session: SessionDep ):
    user = User.model_validate( user )
    username = user.username
    contact = user.email or user.phone_number
    survey = user.survey
    database_service.save( user, session )
    email_service.send_background( 
        background_tasks, 
        'New User!', 
        MAIL_TO, 
        { 'username': username, 'contact': contact, 'survey': survey }
    )
    return user


@database_router.get( "/users", response_model = list[ UserPublic ] )
def read_users( session: SessionDep ):
    return database_service.get_model_instances( User, session )


@database_router.get( "/user/{user_id}", response_model = UserPublic )
def read_user( user_id: int, session: SessionDep ):
    user = session.get( User, user_id )
    database_service.raise_http_exception_if_none( user )
    return user


@database_router.patch( "/user/{user_id}", response_model = UserPublic )
def update_user( user_id: int, user: UserUpdate, session: SessionDep ):
    user = session.get( User, user_id )
    database_service.raise_http_exception_if_none( user )
    user_data = user.model_dump( exclude_unset = True )
    user.sqlmodel_update( user_data )
    database_service.save( user, session )
    return user