# incentive.py

from sqlmodel import Field, SQLModel

class IncentiveBase(SQLModel):
    pass

class Incentive(IncentiveBase, table=True):
    __tablename__ = "incentives"

    id: int | None = Field(default=None, primary_key=True)
    name: str
    required_points: int

class IncentivePublic(IncentiveBase):
    name: str
    required_points: int

class IncentiveUpdate(IncentiveBase):
    name: str | None = None
    required_points: int | None = None

class IncentiveCreate(IncentiveBase):
    name: str
    required_points: int