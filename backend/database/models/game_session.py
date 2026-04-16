# game_session.py

from sqlmodel import Field, SQLModel

class GameSessionBase(SQLModel):
    score: int

class GameSession(GameSessionBase, table=True):
    __tablename__ = "gamesessions"

    id: int | None = Field(default=None, primary_key=True)
    user_id: int | None = Field(default=None, foreign_key="users.id")
    game_id: int | None = Field(default=None, foreign_key="games.id")

class GameSessionPublic(GameSessionBase):
    game_id: int

class GameSessionCreate(GameSessionBase):
    game_key: str