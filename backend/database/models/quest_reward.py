from sqlmodel import Field, SQLModel

class QuestRewardBase(SQLModel):
    pass

class QuestReward(QuestRewardBase, table=True):
    id: int | None = Field(default=None, primary_key=True)
    quest_id: int = Field(foreign_key="quest.id")
    reward_id: int = Field(foreign_key="reward.id")

class QuestRewardPublic(QuestRewardBase):
    pass

class QuestRewardCreate(QuestRewardBase):
    pass

class QuestRewardUpdate(QuestRewardBase):
    pass