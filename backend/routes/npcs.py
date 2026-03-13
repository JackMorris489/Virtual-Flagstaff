from database.models import Npc, NpcPublic
from database.database_service import SessionDep, database_service
from fastapi import APIRouter

npcs_router = APIRouter(prefix="/npcs", tags=["NPCs"])

@npcs_router.get("", response_model = list[Npc])
def read_games(session: SessionDep) -> list[Npc]:
    return database_service.get_model_instances(Npc, session)