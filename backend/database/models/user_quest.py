# user_quest.py

from sqlmodel import Field, SQLModel
from sqlalchemy import UniqueConstraint

class UserQuestBase(SQLModel):
    pass

class UserQuest(UserQuestBase, table=True):
    __tablename__ = "userquests"

    id: int | None = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id")
    quest_id: int = Field(foreign_key="quests.id")
    is_complete: bool
    __table_args__ = (
        UniqueConstraint("user_id", "quest_id"), # Make both user and quest id as a unique pair
    )

class UserQuestPublic(UserQuestBase):
    is_complete: bool

class UserQuestCreate(UserQuestBase):
    user_id: int
    quest_id: int
    is_complete: bool = False

class UserQuestUpdate(UserQuestBase):
    is_complete: bool