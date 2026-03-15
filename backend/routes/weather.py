from fastapi import APIRouter
from weather_service import weather_service

weather_router = APIRouter(prefix="/weather", tags=["Weather"])

@weather_router.get("")
def get_weather() -> dict:
    return weather_service.get_weather()