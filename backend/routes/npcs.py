from database.models import Npc, NpcPublic, Quest, NpcUpdate
from database.database_service import SessionDep, database_service
from fastapi import APIRouter
from sqlmodel import select

npcs_router = APIRouter(prefix="/npcs", tags=["NPCs"])

@npcs_router.get("", response_model = list[Npc])
def read_npcs(session: SessionDep) -> list[Npc]:
    return database_service.get_model_instances(Npc, session)


@npcs_router.get("/{npc_id}/quests", response_model=Quest)
def read_npc_quest(npc_id: int, session: SessionDep) -> Quest:
    query = select(Quest).where(Quest.npc_id == npc_id)
    return database_service.get_query_result(session, query)


@npcs_router.get("/{key}/dialog", response_model=dict[str, list[str]])
def read_npc_dialog(key: str, session: SessionDep):
    query = select(Npc.dialog).where(Npc.key == key)
    return database_service.get_query_result(session, query)


@npcs_router.put("/{key}")
def update_npc(key: str, updated: NpcUpdate, session: SessionDep):
    id_query = select(Npc.id).where(Npc.key == key)
    id = database_service.get_query_result(session, id_query)
    print(id)

    return database_service.set_model_instance_by_id(Npc, session, id, updated)