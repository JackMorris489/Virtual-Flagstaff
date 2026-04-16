# game.py

from sqlmodel import Field, SQLModel

class GameBase(SQLModel):
    name: str = Field(unique=True, index=True)
    key: str = Field(unique=True, index=True)

class Game(GameBase, table=True):
    __tablename__ = "games"

    id: int | None = Field(default=None, primary_key=True)

class GamePublic(GameBase):
    pass

class GameCreate(GameBase):
    pass

class GameUpdate(GameBase):
    pass