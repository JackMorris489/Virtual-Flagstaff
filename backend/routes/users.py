# users.py

from database.models import User, UserCreate, UserPublic, UserUpdate
from database.database_service import SessionDep, database_service
from fastapi import APIRouter, BackgroundTasks
from email_utilities import EmailService

email_service = EmailService()
users_router = APIRouter(prefix="/users", tags=["Users"])

@users_router.post("", response_model = UserPublic)
def create_user(user: UserCreate, session: SessionDep) -> UserPublic:
    return database_service.create_model_instance(User, session, user)


@users_router.get( "", response_model = list[UserPublic] )
def read_users( session: SessionDep ):
    return database_service.get_model_instances(User, session)


@users_router.get("/{user_id}", response_model = UserPublic)
def read_user(user_id: int, session: SessionDep):
    return database_service.get_model_instance_by_id(User, session, user_id)


@users_router.patch("/{user_id}", response_model = UserPublic)
def update_user(
    background_tasks: BackgroundTasks, 
    user_id: int, 
    user: UserUpdate, 
    session: SessionDep
):
    if user.survey is not None:
        user_db = database_service.get_model_instance_by_id(User, session, user_id)
        email_service.notify_client_of_new_user( 
            background_tasks,
            user_db.username, 
            user_db.email or user_db.phone_number, 
            user.survey
        )
    return database_service.set_model_instance_by_id(User, session, user_id, user)


@users_router.delete("/{user_id}")
def delete_user(user_id: int, session: SessionDep):
    return database_service.delete_model_instance( User, session, user_id )