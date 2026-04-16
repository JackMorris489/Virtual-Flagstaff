# npc.py

from sqlmodel import Field, SQLModel, Relationship

class NpcBase(SQLModel):
    name: str = Field(unique=True, index=True)

class Npc(NpcBase, table=True):
    __tablename__ = "npcs"

    id: int | None = Field(default=None, primary_key=True)
    x_pos: int
    y_pos: int

    quests: list["Quest"] = Relationship(back_populates="npc", cascade_delete=True)

class NpcPublic(NpcBase):
    pass

class NpcCreate(NpcBase):
    pass

class NpcUpdate(NpcBase):
    pass