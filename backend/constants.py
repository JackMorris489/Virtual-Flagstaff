# constants.py

from dotenv import load_dotenv
from os import getenv

load_dotenv()

HOURLY_FLAGSTAFF_WEATHER_API_URL = getenv( "HOURLY_FLAGSTAFF_WEATHER_API_URL" )
DATABASE_URL = getenv( "DATABASE_URL" )