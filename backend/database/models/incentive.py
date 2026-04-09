# incentive.py

from sqlmodel import Field, SQLModel

class IncentiveBase(SQLModel):
    pass

class Incentive(IncentiveBase, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str
    required_points: int

class IncentivePublic(IncentiveBase):
    name: str
    required_points: int