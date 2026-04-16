from sqlmodel import Field, SQLModel, Relationship
from database.models import Quest, Reward

class QuestRewardBase(SQLModel):
    pass

class QuestReward(QuestRewardBase, table=True):
    __tablename__ = "questrewards"

    id: int | None = Field(default=None, primary_key=True)
    quest_id: int = Field(foreign_key="quests.id", ondelete="CASCADE")
    reward_id: int = Field(foreign_key="rewards.id", ondelete="CASCADE")

    quest: Quest | None = Relationship(back_populates="quest_rewards")
    reward: Reward | None = Relationship(back_populates="quest_rewards")

class QuestRewardPublic(QuestRewardBase):
    pass

class QuestRewardCreate(QuestRewardBase):
    pass

class QuestRewardUpdate(QuestRewardBase):
    pass