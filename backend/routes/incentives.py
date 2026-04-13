from database.models import Incentive, IncentivePublic
from database.database_service import SessionDep, database_service
from fastapi import APIRouter

incentives_router = APIRouter(prefix="/incentives", tags=["Incentives"])

@incentives_router.get("", response_model = list[IncentivePublic])
def read_games(session: SessionDep) -> list[IncentivePublic]:
    return database_service.get_model_instances(Incentive, session)