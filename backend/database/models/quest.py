# quest.py

from sqlmodel import Field, SQLModel, Relationship
from database.models import Npc

class QuestBase(SQLModel):
    name: str = Field(unique=True, index=True)
    description: str

class Quest(QuestBase, table=True):
    __tablename__ = "quests"

    id: int | None = Field(default=None, primary_key=True)
    npc_id: int = Field(foreign_key="npcs.id", ondelete="CASCADE")

    npc: Npc | None = Relationship(back_populates="quests")

    user_quests: list["UserQuest"] = Relationship(back_populates="quest", cascade_delete=True)
    quest_rewards: list["QuestReward"] = Relationship(back_populates="quest", cascade_delete=True)

class QuestPublic(QuestBase):
    pass

class QuestCreate(QuestBase):
    pass

class QuestUpdate(QuestBase):
    pass