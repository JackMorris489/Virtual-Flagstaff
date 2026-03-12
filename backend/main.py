# main.py

from fastapi import FastAPI
from fastapi.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from routes import (
    users_router, 
    game_sessions_router, 
    auth_router,
    weather_router,
    games_router,
    npcs_router,
    quests_router
)
from database import database_service

@asynccontextmanager
async def lifespan(app: FastAPI):
    database_service.create_database_and_tables()
    database_service.seed_all()
    yield
    
app = FastAPI(lifespan=lifespan)

app.include_router(users_router)
app.include_router(game_sessions_router)
app.include_router(auth_router)
app.include_router(weather_router)
app.include_router(games_router)
app.include_router(npcs_router)
app.include_router(quests_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/", include_in_schema = False)
def read_root() -> RedirectResponse:
    return RedirectResponse(url = "/docs")