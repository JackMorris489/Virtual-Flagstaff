# game_session.py

from sqlmodel import Field, SQLModel, Relationship
from database.models import User, Game

class GameSessionBase(SQLModel):
    score: int

class GameSession(GameSessionBase, table=True):
    __tablename__ = "gamesessions"

    id: int | None = Field(default=None, primary_key=True)
    user_id: int | None = Field(default=None, foreign_key="users.id", ondelete="CASCADE")
    game_id: int | None = Field(default=None, foreign_key="games.id", ondelete="CASCADE")

    user: User | None = Relationship(back_populates="game_sessions")
    game: Game | None = Relationship(back_populates="game_sessions")

class GameSessionPublic(GameSessionBase):
    game_id: int

class GameSessionCreate(GameSessionBase):
    game_key: str