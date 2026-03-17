from database.models import QuestReward
from database.database_service import SessionDep, database_service
from fastapi import APIRouter

quest_rewards_router = APIRouter(prefix="/quest-rewards", tags=["Quest Rewards"])

@quest_rewards_router.get("", response_model = list[QuestReward])
def read_games(session: SessionDep) -> list[QuestReward]:
    return database_service.get_model_instances(QuestReward, session)