from sqlmodel import Field, SQLModel

class RewardBase(SQLModel):
    pass

class Reward(RewardBase, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str = Field(index=True)
    key: str

class RewardPublic(RewardBase):
    pass

class RewardCreate(RewardBase):
    pass

class RewardUpdate(RewardBase):
    pass