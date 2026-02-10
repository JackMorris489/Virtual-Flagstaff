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


    def create_model_instance(
        self,
        model: SQLModel,
        session: Session,
        model_data: SQLModel
    ) -> SQLModel:
        model_data = model.model_validate( model_data )
        self.save( model_data, session )
        return model_data


    def get_model_instance_by_id(
        self,
        model: SQLModel,
        session: Session,
        id: int
    ) -> SQLModel:
        model_instance = session.get( model, id )
        self.raise_http_exception_if_none( model_instance )
        return model_instance
    
    def set_model_instance_by_id(
        self,
        model: SQLModel,
        session: Session,
        id: int,
        new_data: SQLModel
    ) -> SQLModel:
        model_instance = session.get( model, id )
        self.raise_http_exception_if_none( model_instance )
        new_data = new_data.model_dump( exclude_unset = True )
        model_instance.sqlmodel_update( new_data )
        self.save( model_instance, session )
        return model_instance
    

    def delete_model_instance(
        self,
        model: SQLModel,
        session: Session,
        model_instance_id: int
    ):
        model_instance = session.get( model, model_instance_id )
        self.raise_http_exception_if_none( model_instance )
        session.delete( model_instance )
        session.commit()
        return { "detail": f"{model.__name__} with id {model_instance_id} deleted" }


    def get_model_instance(
        self,
        model: SQLModel,
        session: Session,
        query: str
    ):
        return session.exec( query ).first()

database_service = DatabaseService()

SessionDep = Annotated[ Session, Depends( database_service.get_session ) ]