# email_utilities.py

from fastapi import BackgroundTasks
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from constants import (
    MAIL_USERNAME,
    MAIL_PASSWORD,
    MAIL_FROM,
    MAIL_PORT,
    MAIL_SERVER,
    MAIL_FROM_NAME,
    MAIL_TO
)

CONNECTION_CONFIGURATION = ConnectionConfig(
    MAIL_USERNAME = MAIL_USERNAME,
    MAIL_PASSWORD = MAIL_PASSWORD,
    MAIL_FROM = MAIL_FROM,
    MAIL_PORT = MAIL_PORT,
    MAIL_SERVER = MAIL_SERVER,
    MAIL_FROM_NAME = MAIL_FROM_NAME,
    MAIL_STARTTLS = True,
    MAIL_SSL_TLS = False,
    USE_CREDENTIALS = True,
    TEMPLATE_FOLDER = "./templates"
)

class EmailService:
    def __init__( 
        self, 
        connection_config: ConnectionConfig = CONNECTION_CONFIGURATION
    ) -> None:
        self._fast_mail = FastMail( connection_config )


    def _prepare_message( 
        self, 
        subject: str, 
        email_to: str, 
        body: dict
    ) -> MessageSchema:
        return MessageSchema( subject = subject,
                              recipients = [ email_to ],
                              template_body = body,
                              subtype = "html" )


    async def send_async(
        self, 
        subject: str, 
        email_to: str, 
        body: dict,
        template: str = "email.html"
    ) -> None:
        message = self._prepare_message( subject, email_to, body )
        await self._fast_mail.send_message( message, template_name = template )


    def send_background( 
        self, 
        background_tasks: BackgroundTasks,
        subject: str, 
        email_to: str, 
        body: dict,
        template: str = "email.html"
    ) -> None:
        message = self._prepare_message( subject, email_to, body )
        background_tasks.add_task( self._fast_mail.send_message, 
                                   message, 
                                   template_name = template )


    def notify_client_of_new_user( 
        self, 
        background_tasks: BackgroundTasks,
        username: str, 
        contact: str, 
        survey: dict
    ) -> None:
        subject = "New User!"
        body = {
            "username": username,
            "contact": contact,
            "survey": survey
        }
        self.send_background( background_tasks, subject, MAIL_TO, body )