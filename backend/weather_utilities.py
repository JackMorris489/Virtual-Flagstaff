# weather_utilities.py

import requests

def fetch_request( url: str ) -> dict:
    response = requests.get( url )
    return response.json()


def get_weather_api_data( weather_api_url: str ) -> dict:
    return fetch_request( weather_api_url )


def get_forecast( weather_data: dict ) -> str:
    return weather_data[ "properties" ][ "periods" ][ 1 ][ "shortForecast" ]


def get_temperature( weather_data: dict ) -> int:
    return weather_data[ "properties" ][ "periods" ][ 1 ][ "temperature" ]