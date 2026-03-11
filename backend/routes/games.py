from database.models import Game, GamePublic
from database.database_service import SessionDep, database_service
from fastapi import APIRouter

games_router = APIRouter(prefix="/games", tags=["Games"])

@games_router.get("", response_model = list[GamePublic])
def read_games(session: SessionDep) -> list[GamePublic]:
    return database_service.get_model_instances(Game, session)