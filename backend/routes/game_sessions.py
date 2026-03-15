from database.models import GameSession, GameSessionPublic, User, Game
from database.database_service import SessionDep, database_service
from fastapi import APIRouter
from sqlalchemy import select
from pydantic import BaseModel

class LeaderboardEntry(BaseModel):
    username: str
    score: int

game_sessions_router = APIRouter(prefix="/game-sessions", tags=["GameSessions"])

@game_sessions_router.get("", response_model = list[GameSessionPublic])
def get_game_sessions(session: SessionDep) -> list[GameSessionPublic]:
    return database_service.get_model_instances(GameSession, session)


@game_sessions_router.get("/{game_key}/leaderboard")
def get_game_leaderboard(game_key: str, session: SessionDep):
    query = (
        select(User.username, GameSession.score)
        .join(GameSession, GameSession.user_id == User.id)
        .join(Game, Game.id == GameSession.game_id)
        .where(Game.key == game_key)
        .order_by(GameSession.score.desc())
    )
    
    results = database_service.get_query_results(session, query, limit=5)

    leaderboard = [LeaderboardEntry(username=r[0], score=r[1]) for r in results]

    return leaderboard