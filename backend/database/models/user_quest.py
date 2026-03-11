# user_quest.py

from sqlmodel import Field, SQLModel

class UserQuestBase(SQLModel):
    is_complete: bool | None

class UserQuest(UserQuestBase, table=True):
    id: int | None = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    quest_id: int = Field(foreign_key="quest.id")

class UserQuestPublic(UserQuestBase):
    pass

class UserQuestCreate(UserQuestBase):
    pass

class UserQuestUpdate(UserQuestBase):
    pass