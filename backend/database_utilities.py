# database_utitlities.py

from sqlmodel import Session, SQLModel, create_engine, select
from typing import Annotated
from fastapi import Depends, Query, HTTPException
from constants import DATABASE_URL

engine = create_engine( DATABASE_URL )

def create_database_and_tables():
    SQLModel.metadata.create_all( engine )


def get_session():
    with Session(engine) as session:
        yield session

SessionDep = Annotated[ Session, Depends( get_session ) ]

def save_to_database( model_instance: SQLModel, session: SessionDep ) -> None:
    session.add( model_instance )
    session.commit()
    session.refresh( model_instance )

def get_model_instances( 
    model_class: type[ SQLModel ],
    session: SessionDep,
    offset: int = 0,
    limit: Annotated[ int, Query( le = 100 ) ] = 100 ):
    return session.exec( select( model_class ).offset( offset ).limit( limit ) ).all()


def raise_http_exception_if_none( 
    model_instance: SQLModel | None,
    status_code: int,
    detail: str ) -> None:
    if not model_instance:
        raise HTTPException( status_code = status_code, detail = detail )