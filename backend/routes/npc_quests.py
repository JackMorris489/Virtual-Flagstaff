from database.models import NpcQuest, NpcQuestPublic
from database.database_service import SessionDep, database_service
from fastapi import APIRouter

npc_quest_router = APIRouter(prefix="/npc_quests", tags=["Npc Quests"])

@npc_quest_router.get("", response_model = list[NpcQuestPublic])
def read_games(session: SessionDep) -> list[NpcQuestPublic]:
    return database_service.get_model_instances(NpcQuest, session)