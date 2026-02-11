from sqlmodel import (
    Field, 
    SQLModel
)

class GameSession(SQLModel, table=True):
    id: int|None = Field(default=None, primary_key=True)
    user_id: int|None = Field(default=None, foreign_key="user.id")
    game_id: int|None = Field(default=None, foreign_key="game.id")
    score: int = Field(default=0)