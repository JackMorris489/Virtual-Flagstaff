# users.py

from database.models import (
    User, 
    UserPublic, 
    UserUpdate,
    UserQuest,
    UserQuestPublic,
    UserQuestCreate,
    UserQuestUpdate,
    Quest,
    QuestPublic,
    GameSession,
    GameSessionPublic,
    GameSessionCreate,
    Game,
    Reward,
    QuestReward
)
from database.database_service import SessionDep, database_service
from fastapi import APIRouter, BackgroundTasks, Header, HTTPException
from email_utilities import EmailService
from sqlmodel import select, and_
from constants import ADMIN_EMAIL_BROADCAST_KEY
from auth.dependencies import CurrentUser

email_service = EmailService()
users_router = APIRouter(prefix="/users", tags=["Users"])


@users_router.get("", response_model = list[User])
def read_users(session: SessionDep) -> list[User]:
    return database_service.get_model_instances(User, session)


@users_router.get("/me", response_model = UserPublic)
def read_user(user: CurrentUser) -> UserPublic:
    return user


@users_router.patch("/me", response_model = UserPublic)
def update_user(
    background_tasks: BackgroundTasks, 
    user: CurrentUser,
    user_update: UserUpdate, 
    session: SessionDep
) -> UserPublic:
    if user_update.survey is not None:
        user_db = database_service.get_model_instance_by_id(User, session, user.id)
        if user_db.receive_notifications:
            email_service.notify_client_of_new_user( 
                background_tasks,
                user_db.username, 
                user_db.email or user_db.phone_number, 
                user_update.survey
            )
            
    return database_service.set_model_instance_by_id(User, session, user.id, user_update)


@users_router.delete("/{user_id}")
def delete_user(user_id: int, session: SessionDep):
    return database_service.delete_model_instance( User, session, user_id )


@users_router.get("/quests", response_model=list[UserQuest])
def read_all_user_quests(session: SessionDep) -> list[UserQuest]:
    return database_service.get_model_instances(UserQuest, session)


@users_router.get("/me/quests", response_model=list[QuestPublic])
def read_user_quests(
    user: CurrentUser,
    session: SessionDep
) -> list[QuestPublic]:
    query = select(Quest) \
    .join(UserQuest, UserQuest.quest_id == Quest.id) \
    .where(
        and_(
            UserQuest.user_id == user.id,
            UserQuest.is_complete == False
        )
    )
    return database_service.get_query_results(session, query)


@users_router.get("/me/quests/{quest_id}", response_model=UserQuestPublic)
def read_user_quest(
    user: CurrentUser, 
    quest_id: int, 
    session: SessionDep
) -> UserQuestPublic:
    query = select(UserQuest).where(
        UserQuest.user_id == user.id,
        UserQuest.quest_id == quest_id
    )
    existing = database_service.get_query_result(session, query)

    if not existing:
        raise HTTPException(404, "Quest not assigned")
    
    return existing


@users_router.post("/me/quests/{quest_id}", response_model=UserQuestPublic)
def create_user_quest(
    user: CurrentUser,
    quest_id: int,
    session: SessionDep
) -> UserQuestPublic:
    query = select(UserQuest).where(
        UserQuest.user_id == user.id,
        UserQuest.quest_id == quest_id
    )
    existing = database_service.get_query_result(session, query)

    if existing:
        returning_user_quest = existing

    else:
        user_quest = UserQuestCreate(
            user_id=user.id,
            quest_id=quest_id
        )

        returning_user_quest = database_service.create_model_instance(UserQuest, session, user_quest)

    return returning_user_quest

@users_router.patch("/me/quests/{quest_id}", response_model=UserQuestPublic)
def update_user_quest(
    user: CurrentUser,
    quest_id: int,
    session: SessionDep
) -> UserQuestPublic:
    query = select(UserQuest).where(
        and_(
            UserQuest.user_id == user.id,
            UserQuest.quest_id == quest_id
        )
    )
    
    user_quest: UserQuest = database_service.get_query_result(session, query)

    if not user_quest.is_complete:
        updated_user_quest = UserQuestUpdate(is_complete=True)

        returning_user_quest = database_service.set_model_instance_by_id(
            UserQuest, 
            session, 
            user_quest.id, 
            updated_user_quest
        )
    
    else:
        returning_user_quest = user_quest

    return returning_user_quest


@users_router.post("/me/game-sessions", response_model=GameSessionPublic)
def create_game_session(
    user: CurrentUser,
    game_session_args: GameSessionCreate,
    session: SessionDep
) -> GameSessionPublic:
    
    query = select(Game).where(Game.key == game_session_args.game_key)
    game: Game = database_service.get_query_result(session, query)

    game_session = GameSession(
        score=game_session_args.score, 
        user_id=user.id, 
        game_id=game.id
    )

    return database_service.create_model_instance(
        GameSession, 
        session, 
        game_session
    )


@users_router.get("/me/rewards", response_model=list[Reward])
def get_user_rewards(user: CurrentUser, db: SessionDep):
    query = (
        select(Reward)
        .join(QuestReward, QuestReward.reward_id == Reward.id)
        .join(UserQuest, UserQuest.quest_id == QuestReward.quest_id)
        .where(
            and_(
                UserQuest.user_id == user.id,
                UserQuest.is_complete
            )
        )
    )

    return database_service.get_query_results(db, query)


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