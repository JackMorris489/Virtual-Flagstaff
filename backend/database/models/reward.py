from sqlmodel import Field, SQLModel, Relationship

class RewardBase(SQLModel):
    pass

class Reward(RewardBase, table=True):
    __tablename__ = "rewards"

    id: int | None = Field(default=None, primary_key=True)
    name: str = Field(index=True)
    key: str

    quest_rewards: list["QuestReward"] = Relationship(back_populates="reward", cascade_delete=True)

class RewardPublic(RewardBase):
    pass

class RewardCreate(RewardBase):
    pass

class RewardUpdate(RewardBase):
    pass