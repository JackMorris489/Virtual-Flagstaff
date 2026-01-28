from fastapi import FastAPI
from fastapi.responses import FileResponse
import requests

from dotenv import load_dotenv

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

app = FastAPI()

load_dotenv()

def fetch_request( url: str ) -> dict:
    response = requests.get( url )
    return response.json()

@app.get( "/api/weather" )
def get_weather():

    # Extract the short forecast for the next hour
    def get_forecast( json_data: dict ) -> str:
        return json_data[ "properties" ][ "periods" ][ 1 ][ "shortForecast" ]

    def get_temperature( json_data: dict ) -> int:
        return json_data[ "properties" ][ "periods" ][ 1 ][ "temperature" ]

    # Hourly weather URL for Flagstaff, AZ
    URL = "https://api.weather.gov/gridpoints/FGZ/74,89/forecast/hourly"

    # Get forecast in Flagstaff, AZ
    json_data = fetch_request( URL )

    return {
        "forecast": get_forecast( json_data ),
        "temperature": get_temperature( json_data )
    }

@app.post( "submit-customer-data" )
def submit_customer_data( customer_data: dict ):
    first_name = customer_data[ "name" ][ "first" ]
    last_name = customer_data[ "name" ][ "last" ]
    email = customer_data[ "email" ]
    phone_number = customer_data[ "phoneNumber" ]
    pass
    