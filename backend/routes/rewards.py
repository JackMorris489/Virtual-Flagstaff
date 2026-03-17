from database.models import Reward
from database.database_service import SessionDep, database_service
from fastapi import APIRouter

rewards_router = APIRouter(prefix="/rewards", tags=["Rewards"])

@rewards_router.get("", response_model = list[Reward])
def read_rewards(session: SessionDep) -> list[Reward]:
    return database_service.get_model_instances(Reward, session)