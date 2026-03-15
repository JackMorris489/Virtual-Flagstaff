# quest.py

from sqlmodel import Field, SQLModel

class QuestBase(SQLModel):
    name: str = Field(unique=True, index=True)
    description: str

class Quest(QuestBase, table=True):
    id: int | None = Field(default=None, primary_key=True)
    npc_id: int = Field(foreign_key="npc.id")

class QuestPublic(QuestBase):
    pass

class QuestCreate(QuestBase):
    pass

class QuestUpdate(QuestBase):
    pass