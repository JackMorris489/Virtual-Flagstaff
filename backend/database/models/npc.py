# npc.py

from sqlmodel import Field, SQLModel, Relationship, Column
from sqlalchemy.dialects.postgresql import JSONB

class NpcBase(SQLModel):
    name: str = Field(unique=True, index=True)

class Npc(NpcBase, table=True):
    __tablename__ = "npcs"

    id: int | None = Field(default=None, primary_key=True)
    key: str = Field(index=True, unique=True)
    x_pos: int
    y_pos: int
    dialog: dict[str, list[str]] = Field(default=None, sa_column=Column(JSONB))

    quests: list["Quest"] = Relationship(back_populates="npc", cascade_delete=True)

class NpcPublic(NpcBase):
    pass

class NpcCreate(NpcBase):
    pass

class NpcUpdate(NpcBase):
    pass