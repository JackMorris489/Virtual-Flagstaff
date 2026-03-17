from database.models import Quest, QuestPublic
from database.database_service import SessionDep, database_service
from fastapi import APIRouter

quests_router = APIRouter(prefix="/quests", tags=["Quests"])

@quests_router.get("", response_model = list[Quest])
def read_games(session: SessionDep) -> list[Quest]:
    return database_service.get_model_instances(Quest, session)