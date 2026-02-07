# database_utitlities.py

from sqlmodel import Session, SQLModel, create_engine, select
from typing import Annotated
from fastapi import Depends, HTTPException
from constants import DATABASE_URL

class DatabaseService:
    def __init__( self, database_url: str = DATABASE_URL ):
        self._engine = create_engine( database_url )

    def create_database_and_tables( self ) -> None:
        SQLModel.metadata.create_all( self._engine )

    def get_session( self ):
        with Session( self._engine ) as session:
            yield session

    def save( self, model_instance: SQLModel, session: Session ) -> None:
        session.add( model_instance )
        session.commit()
        session.refresh( model_instance )

    def offset_query( self, query, offset: int ):
        return query.offset( offset )
    
    def limit_query( self, query, limit: int ):
        return query.limit( limit )
    
    def paginate_query( self, query, offset: int, limit: int ):
        query = self.offset_query( query, offset )
        
        return self.limit_query( query, limit )
    
    def create_query( self, model_class: type[ SQLModel ], offset: int, limit: int ):
        query = select( model_class )

        return self.paginate_query( query, offset, limit )
    
    def get_model_instances(
        self,
        model_class: type[ SQLModel ],
        session: Session,
        offset: int = 0,
        limit: int = 25
    ) -> list[ SQLModel ]:
        query = select( model_class )

        query = self.paginate_query( query, offset, limit )

        return session.exec( query ).all()
    
    def raise_http_exception_if_none(
        self,
        model_instance: SQLModel | None,
        detail: str = "Item not found",
        status_code: int = 404
    ) -> None:
        if not model_instance:
            raise HTTPException( status_code = status_code, detail = detail )

database_service = DatabaseService()

SessionDep = Annotated[ Session, Depends( database_service.get_session ) ]