from database.models import GameSession, GameSessionPublic
from database.database_service import SessionDep, database_service
from fastapi import APIRouter

game_sessions_router = APIRouter(prefix="/game-sessions", tags=["GameSessions"])

@game_sessions_router.get("", response_model = list[GameSessionPublic])
def get_game_sessions(session: SessionDep) -> list[GameSessionPublic]:
    return database_service.get_model_instances(GameSession, session)