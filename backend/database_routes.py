# database_routes.py

from database_models.user_models import (
    User, 
    UserCreate, 
    UserPublic, 
    UserUpdate,
    SurveySubmission
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
def create_user( 
    background_tasks: BackgroundTasks, 
    user: UserCreate, 
    session: SessionDep
) -> UserPublic:
    user = database_service.create_model_instance( User, session, user )
    email_service.notify_client_of_new_user( 
        background_tasks, 
        user.username, 
        user.email or user.phone_number, 
        user.survey
    )
    return user


@database_router.get( "/users", response_model = list[ UserPublic ] )
def read_users( session: SessionDep ):
    return database_service.get_model_instances( User, session )


@database_router.get( "/user/{user_id}", response_model = UserPublic )
def read_user( user_id: int, session: SessionDep ):
    return database_service.get_model_instance_by_id( User, session, user_id )


@database_router.patch( "/user/{user_id}", response_model = UserPublic )
def update_user( user_id: int, user: UserUpdate, session: SessionDep ):
    return database_service.set_model_instance_by_id( User, session, user_id, user )

@database_router.delete( "/user/{user_id}" )
def delete_user( user_id: int, session: SessionDep ):
    return database_service.delete_model_instance( User, session, user_id )
