# game_session.py

from sqlmodel import Field, SQLModel

class GameSessionsBase(SQLModel):
    score: int = Field(default=0)

class GameSession(GameSessionsBase, table=True):
    id: int | None = Field(default=None, primary_key=True)
    user_id: int | None = Field(default=None, foreign_key="user.id")
    game_id: int | None = Field(default=None, foreign_key="game.id")

class GameSessionPublic(GameSessionsBase):
    pass

class GameSessionCreate(GameSessionsBase):
    pass