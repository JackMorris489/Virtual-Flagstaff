from database.models import GameSession, GameSessionPublic, GameSessionCreate, UserPublic
from database.database_service import SessionDep, database_service
from fastapi import APIRouter

game_sessions_router = APIRouter(prefix="/game-sessions", tags=["GameSessions"])

@game_sessions_router.post("", response_model = GameSessionPublic)
def create_game_session(
    game_session: GameSessionCreate,
    session: SessionDep
) -> GameSessionPublic:
    return database_service.create_model_instance(GameSession, session, game_session)