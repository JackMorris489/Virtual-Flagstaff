# main.py

from fastapi import FastAPI

from weather_utilities import (
    get_weather_api_data,
    get_forecast,
    get_temperature
)

from constants import (
    HOURLY_FLAGSTAFF_WEATHER_API_URL
)

from database_routes import database_router

from database_utilities import (
    create_database_and_tables
)

app = FastAPI()

app.include_router( database_router )

@app.on_event("startup")
def on_startup():
    create_database_and_tables()

@app.get( "/api/weather" )
def get_weather() -> dict:

    flagstaff_weather_data = \
                        get_weather_api_data( HOURLY_FLAGSTAFF_WEATHER_API_URL )

    return {
        "forecast": get_forecast( flagstaff_weather_data ),
        "temperature": get_temperature( flagstaff_weather_data )
    }
