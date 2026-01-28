# main.py

from fastapi import Depends, FastAPI, HTTPException, Query

from weather_utilities import (
    get_weather_api_data,
    get_forecast,
    get_temperature 
)

from constants import (
    HOURLY_FLAGSTAFF_WEATHER_API_URL,
    DATABASE_URL
)

from database_models import (
    User
)

from database_utilities import (
    create_database_and_tables
)

app = FastAPI()

create_database_and_tables( DATABASE_URL, { "check_same_thread": False } )

@app.get( "/api/weather" )
def get_weather() -> dict:

    flagstaff_weather_data = get_weather_api_data( HOURLY_FLAGSTAFF_WEATHER_API_URL )

    return {
        "forecast": get_forecast( flagstaff_weather_data ),
        "temperature": get_temperature( flagstaff_weather_data )
    }


@app.post( "/submit-user-data" )
def submit_customer_data( user_data: User ):
    username= user_data[ "username" ]
    email = user_data[ "email" ]
    phone_number = user_data[ "phoneNumber" ]
    password = user_data[ "password" ]
    send_emails = user_data[ "sendEmails" ]
    pass
    