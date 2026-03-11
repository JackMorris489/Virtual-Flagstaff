# users.py
from fastapi import Depends
from database.models import (
    User, 
    UserPublic, 
    UserUpdate,
    UserQuest,
    UserQuestPublic,
    Quest
)
from database.database_service import SessionDep, database_service
from fastapi import APIRouter, BackgroundTasks, Header, HTTPException
from email_utilities import EmailService
from sqlmodel import select
from constants import ADMIN_EMAIL_BROADCAST_KEY
from auth.dependencies import get_current_active_user
from typing import Annotated

email_service = EmailService()
users_router = APIRouter(prefix="/users", tags=["Users"])

# @users_router.post("", response_model = UserPublic)
# def create_user(user: UserCreate, session: SessionDep) -> UserPublic:
#     return database_service.create_model_instance(User, session, user)


@users_router.get("", response_model = list[UserPublic])
def read_users(
    session: SessionDep
):
    return database_service.get_model_instances(User, session)


@users_router.get("/", response_model = UserPublic)
def read_user(user: Annotated[User, Depends(get_current_active_user)]):
    return user


@users_router.patch("/{user_id}", response_model = UserPublic)
def update_user(
    background_tasks: BackgroundTasks, 
    user_id: int, 
    user: UserUpdate, 
    session: SessionDep
):
    if user.survey is not None:
        user_db = database_service.get_model_instance_by_id(User, session, user_id)
        if user_db.receive_notifications:
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


@users_router.post("/me/quests", response_model=UserQuestPublic)
def create_user_quest(
    user: Annotated[User, Depends(get_current_active_user)],
    npc_id: int,
    session: SessionDep
):
    quest_query = select(Quest).where(Quest.npc_id == npc_id)
    quest = database_service.get_model_instances(Quest, session)
    user_quest = UserQuest(
        user_id=user.id,
        quest_id=quest.id,
        is_complete=False
    )

    database_service.create_model_instance(UserQuest, session, user_quest)


@users_router.post("/notifications/broadcast")
def broadcast_to_opted_in_users(
    background_tasks: BackgroundTasks,
    payload: dict,
    session: SessionDep,
    x_admin_key: str | None = Header(default=None),
):
    if not ADMIN_EMAIL_BROADCAST_KEY:
        raise HTTPException(status_code=500, detail="ADMIN_EMAIL_BROADCAST_KEY not set")

    if x_admin_key != ADMIN_EMAIL_BROADCAST_KEY:
        raise HTTPException(status_code=401, detail="Unauthorized")

    subject = payload.get("subject")
    html_content = payload.get("html")  # client can send HTML
    if not subject or not html_content:
        raise HTTPException(status_code=400, detail="subject and html are required")

    # only users who opted in + actually have an email
    query = select(User).where(
        User.receive_notifications == True, 
        User.email != None,
    )
    users = session.exec(query).all()
    recipients = [u.email for u in users if u.email]

    email_service.broadcast_html_email(
        background_tasks=background_tasks,
        subject=subject,
        recipients=recipients,
        html=html_content,
    )

    return {"sent_to": len(recipients)}