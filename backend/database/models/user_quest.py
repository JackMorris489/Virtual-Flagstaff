# user_quest.py

from sqlmodel import Field, SQLModel, Relationship
from sqlalchemy import UniqueConstraint
from database.models import User, Quest

class UserQuestBase(SQLModel):
    pass

class UserQuest(UserQuestBase, table=True):
    __tablename__ = "userquests"

    id: int | None = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", ondelete="CASCADE")
    quest_id: int = Field(foreign_key="quests.id", ondelete="CASCADE")
    is_complete: bool
    __table_args__ = (
        UniqueConstraint("user_id", "quest_id"), # Make both user and quest id as a unique pair
    )

    user: User | None = Relationship(back_populates="user_quests")
    quest: Quest | None = Relationship(back_populates="user_quests")

class UserQuestPublic(UserQuestBase):
    is_complete: bool

class UserQuestCreate(UserQuestBase):
    user_id: int
    quest_id: int
    is_complete: bool = False

class UserQuestUpdate(UserQuestBase):
    is_complete: bool