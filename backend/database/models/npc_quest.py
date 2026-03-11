# npc_quest.py

from sqlmodel import Field, SQLModel

class NpcQuestBase(SQLModel):
    pass

class NpcQuest(NpcQuestBase, table=True):
    id: int | None = Field(default=None, primary_key=True)
    npc_id: int = Field(foreign_key="npc.id")
    quest_id: int = Field(foreign_key="quest.id")

class NpcQuestPublic(NpcQuestBase):
    pass

class NpcQuestCreate(NpcQuestBase):
    pass

class NpcQuestUpdate(NpcQuestBase):
    pass