# database_utitlities.py

from sqlmodel import (
    SQLModel, 
    create_engine
)

def initialize_engine( database_url: str, connect_args: dict ):
    return create_engine( database_url, connect_args = connect_args )


def create_database_and_tables( database_url: str, connect_args: dict ):
    engine = initialize_engine( database_url, connect_args )
    SQLModel.metadata.create_all( engine )