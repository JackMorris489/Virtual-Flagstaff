from database.models import Quest, QuestPublic, Reward, QuestReward
from database.database_service import SessionDep, database_service
from fastapi import APIRouter
from sqlalchemy import select

quests_router = APIRouter(prefix="/quests", tags=["Quests"])

@quests_router.get("", response_model = list[Quest])
def read_games(session: SessionDep) -> list[Quest]:
    return database_service.get_model_instances(Quest, session)

@quests_router.get("/{quest_id}/rewards", response_model=list[Reward])
def get_rewards(quest_id: int, session: SessionDep) -> list[Reward]:
    query = (
        select(Reward)
        .join(QuestReward, QuestReward.reward_id == Reward.id)
        .where(QuestReward.quest_id == quest_id)
    )

    return database_service.get_query_results(
        session, 
        query, 
        apply_scalars=True
    )