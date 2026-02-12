# main.py

from fastapi import FastAPI
from fastapi.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from weather_service import weather_service
from database_routes import database_router
from database import database_service

@asynccontextmanager
async def lifespan(app: FastAPI):
    database_service.create_database_and_tables()
    database_service.seed_games()
    yield
    
app = FastAPI(lifespan=lifespan)

app.include_router(database_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get( "/", include_in_schema = False )
def read_root() -> RedirectResponse:
    return RedirectResponse( url = "/docs" )

@app.get( "/weather" )
def get_weather() -> dict:
    return weather_service.get_forecast_summary()
