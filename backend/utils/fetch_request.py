# fetch_request.py

import requests

def fetch_request( url: str ) -> dict:
    response = requests.get( url )
    return response.json()