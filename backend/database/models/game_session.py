# game_session.py

from sqlmodel import Field, SQLModel

class GameSessionBase(SQLModel):
    score: int = Field(default=0)

class GameSession(GameSessionBase, table=True):
    id: int | None = Field(default=None, primary_key=True)
    user_id: int | None = Field(default=None, foreign_key="user.id")
    game_id: int | None = Field(default=None, foreign_key="game.id")

class GameSessionPublic(GameSessionBase):
    game_id: int

class GameSessionCreate(GameSessionBase):
    user_id: int
    game_id: int