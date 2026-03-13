# npc.py

from sqlmodel import Field, SQLModel

class NpcBase(SQLModel):
    name: str = Field(unique=True, index=True)

class Npc(NpcBase, table=True):
    id: int | None = Field(default=None, primary_key=True)

class NpcPublic(NpcBase):
    pass

class NpcCreate(NpcBase):
    pass

class NpcUpdate(NpcBase):
    pass