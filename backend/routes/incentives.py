from database.models import Incentive, IncentivePublic, IncentiveUpdate, IncentiveCreate
from database.database_service import SessionDep, database_service
from fastapi import APIRouter, HTTPException
from sqlmodel import select

incentives_router = APIRouter(prefix="/incentives", tags=["Incentives"])

@incentives_router.get("", response_model = list[Incentive])
def read_incentives(session: SessionDep) -> list[Incentive]:
    return database_service.get_model_instances(Incentive, session)


@incentives_router.delete("/{id}")
def delete_incentive(id: int, session: SessionDep):
    return database_service.delete_model_instance(Incentive, session, id)


@incentives_router.put("/{id}")
def update_incentive(id: int, updated: IncentiveUpdate, session: SessionDep):
    return database_service.set_model_instance_by_id(Incentive, session, id, updated)


@incentives_router.post("")
def update_incentive(created: IncentiveCreate, session: SessionDep):
    query = select(Incentive).where(
        Incentive.name == created.name,
        Incentive.required_points == created.required_points
    )
    existing = database_service.get_query_result(session, query)

    if existing:
        raise HTTPException(409, "Incentive exists")
    
    return database_service.create_model_instance(Incentive, session, created)