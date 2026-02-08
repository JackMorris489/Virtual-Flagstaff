# main.py

from fastapi import FastAPI
from fastapi.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from weather_utilities import (
    get_weather_api_data,
    get_forecast,
    get_temperature
)
from constants import (
    HOURLY_FLAGSTAFF_WEATHER_API_URL
)
from database_routes import database_router
from database_utilities import database_service

@asynccontextmanager
async def lifespan( app: FastAPI ):
    database_service.create_database_and_tables()
    yield
    
app = FastAPI( lifespan = lifespan )

app.include_router( database_router )

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
    flagstaff_weather_data = \
                        get_weather_api_data( HOURLY_FLAGSTAFF_WEATHER_API_URL )
    return {
        "forecast": get_forecast( flagstaff_weather_data ),
        "temperature": get_temperature( flagstaff_weather_data )
    }
