# constants.py

# from dotenv import load_dotenv
from os import getenv

# load_dotenv()

HOURLY_FLAGSTAFF_WEATHER_API_URL = getenv( "HOURLY_FLAGSTAFF_WEATHER_API_URL" )

DATABASE_URL = getenv( "DATABASE_URL" )

MAIL_USERNAME = getenv( "MAIL_USERNAME" )
MAIL_PASSWORD = getenv( "MAIL_PASSWORD" )
MAIL_FROM = getenv( "MAIL_FROM" )
MAIL_PORT = getenv( "MAIL_PORT" )
MAIL_SERVER = getenv( "MAIL_SERVER" )
MAIL_FROM_NAME = getenv( "MAIL_FROM_NAME" )
MAIL_TO = getenv( "MAIL_TO" )