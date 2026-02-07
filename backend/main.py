# main.py

from fastapi import FastAPI, BackgroundTasks
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from weather_utilities import (
    get_weather_api_data,
    get_forecast,
    get_temperature
)

from constants import (
    HOURLY_FLAGSTAFF_WEATHER_API_URL,
    MAIL_USERNAME,
    MAIL_PASSWORD,
    MAIL_FROM,
    MAIL_PORT,
    MAIL_SERVER,
    MAIL_FROM_NAME
)
from database_routes import database_router
from database_utilities import create_database_and_tables

conf = ConnectionConfig(
    MAIL_USERNAME = MAIL_USERNAME,
    MAIL_PASSWORD = MAIL_PASSWORD,
    MAIL_FROM = MAIL_FROM,
    MAIL_PORT = MAIL_PORT,
    MAIL_SERVER = MAIL_SERVER,
    MAIL_FROM_NAME = MAIL_FROM_NAME,
    MAIL_STARTTLS = True,
    MAIL_SSL_TLS = False,
    USE_CREDENTIALS = True,
    TEMPLATE_FOLDER = "templates"
)

async def send_email_async(subject: str, email_to: str, body: dict):
    message = MessageSchema(
        subject=subject,
        recipients=[email_to],
        template_body=body,
        subtype="html",
    )
    
    fm = FastMail(conf)
    await fm.send_message(message, template_name='email.html')

def send_email_background(background_tasks: BackgroundTasks, subject: str, email_to: str, body: dict):
    message = MessageSchema(
        subject=subject,
        recipients=[email_to],
        template_body=body,
        subtype="html",
    )
    fm = FastMail(conf)
    background_tasks.add_task(
       fm.send_message, message, template_name='email.html')

@asynccontextmanager
async def lifespan( app: FastAPI ):
    create_database_and_tables()
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

@app.get( "/" )
def read_root() -> str:
    return "Hello from FastAPI Backend!"

@app.get('/send-email/asynchronous')
async def send_email_asynchronous():
    await send_email_async('Hello World','abg287@nau.edu',
    {'title': 'Hello World', 'name': 'John Doe'})
    return 'Success'
@app.get('/send-email/backgroundtasks')
def send_email_backgroundtasks(background_tasks: BackgroundTasks):
    send_email_background(background_tasks, 'Hello World',   
    'abg287@nau.edu', {'title': 'Hello World', 'name':       'John Doe'})
    return 'Success'

@app.get( "/weather" )
def get_weather() -> dict:
    flagstaff_weather_data = \
                        get_weather_api_data( HOURLY_FLAGSTAFF_WEATHER_API_URL )
    return {
        "forecast": get_forecast( flagstaff_weather_data ),
        "temperature": get_temperature( flagstaff_weather_data )
    }
