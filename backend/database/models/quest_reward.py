from sqlmodel import Field, SQLModel

class QuestRewardBase(SQLModel):
    pass

class QuestReward(QuestRewardBase, table=True):
    __tablename__ = "questrewards"

    id: int | None = Field(default=None, primary_key=True)
    quest_id: int = Field(foreign_key="quests.id")
    reward_id: int = Field(foreign_key="rewards.id")

class QuestRewardPublic(QuestRewardBase):
    pass

class QuestRewardCreate(QuestRewardBase):
    pass

class QuestRewardUpdate(QuestRewardBase):
    pass