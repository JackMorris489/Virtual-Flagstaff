# database_utitlities.py

from sqlmodel import Session, SQLModel, create_engine, select
from typing import Annotated
from fastapi import Depends, Query, HTTPException
from constants import DATABASE_URL

engine = create_engine( DATABASE_URL )

def create_database_and_tables() -> None:
    SQLModel.metadata.create_all( engine )


def get_session():
    with Session(engine) as session:
        yield session

SessionDep = Annotated[ Session, Depends( get_session ) ]

def save_to_database( model_instance: SQLModel, session: SessionDep ) -> None:
    session.add( model_instance )
    session.commit()
    session.refresh( model_instance )


def offset_query( query, offset: int ):
    return query.offset( offset )


def limit_query( query, limit: int ):
    return query.limit( limit )


def paginate_query( query, offset: int, limit: int ):
    query = offset_query( query, offset )
    
    return limit_query( query, limit )


def create_query( model_class: type[ SQLModel ], offset: int, limit: int ):
    query = select( model_class )

    return paginate_query( query, offset, limit )


def get_model_instances( 
    model_class: type[ SQLModel ],
    session: SessionDep,
    offset: int = 0,
    limit: int = 25 ) -> list[ SQLModel ]:
    query = select( model_class )

    query = paginate_query( query, offset, limit )

    return session.exec( query ).all()


def raise_http_exception_if_none( 
    model_instance: SQLModel | None,
    detail: str = "Item not found",
    status_code: int = 404 ) -> None:
    if not model_instance:
        raise HTTPException( status_code = status_code, detail = detail )