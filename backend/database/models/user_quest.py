# user_quest.py

from sqlmodel import Field, SQLModel

class UserQuestBase(SQLModel):
    pass

class UserQuest(UserQuestBase, table=True):
    id: int | None = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    quest_id: int = Field(foreign_key="quest.id")
    is_complete: bool | None

class UserQuestPublic(UserQuestBase):
    is_complete: bool

class UserQuestCreate(UserQuestBase):
    quest_id: int

class UserQuestUpdate(UserQuestBase):
    is_complete: bool