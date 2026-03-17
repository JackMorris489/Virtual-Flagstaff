# weather_service.py

from constants import HOURLY_FLAGSTAFF_WEATHER_API_URL
from utils import fetch_request

CURRENT_HOUR = 0

class WeatherService:
    def __init__(self, api_url: str = HOURLY_FLAGSTAFF_WEATHER_API_URL):
        self._api_url = api_url


    def get_forecasts(self) -> dict:
        raw_fetch_result = fetch_request(self._api_url)
        return raw_fetch_result["properties"]["periods"]


    def get_forecast(self, period: int) -> dict:
        raw_forecasts = self.get_forecasts()
        return raw_forecasts[period]


    def get_weather(self, period: int = CURRENT_HOUR) -> dict:
        forecast = self.get_forecast(period)
        return {
            "shortForecast": forecast["shortForecast"],
            "temperature": forecast["temperature"],
            "temperatureUnit": forecast["temperatureUnit"],
            "isDaytime": forecast["isDaytime"],
        }

weather_service = WeatherService()