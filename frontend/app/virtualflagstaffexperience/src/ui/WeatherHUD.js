import apiFetch from "../../../utils/apiFetch";

export default class WeatherHUD
{
    #scene;
    #container;
    #text;

    constructor(scene, x, y)
    {
        this.#scene = scene

        this.#container = this.#scene.add.container(x, y);

        this.#text = this.#scene.add.text(
            0,
            0,
            "Loading weather...",
            {
                fontSize: "14px",
                color: "#ffffff",
                backgroundColor: "rgba(0,0,0,0.4)",
                padding: { x: 6, y: 4 }
            }
        ).setOrigin(0);

        this.#container.add(this.#text);

        this.init();
    }


    async init() {
        try {
            const { shortForecast, temperature, temperatureUnit } = await this.getWeather();

            this.#text.setText(
                `${shortForecast}  ${temperature}°${temperatureUnit}`
            );

            this.handleOverlaySelection(shortForecast);

        } catch (err) {
            this.#text.setText("Weather unavailable");
        }
    }


    async getWeather() {
        return await apiFetch("/weather");
    }

    handleOverlaySelection(forecast)
    {
        const lowerCasedForecast = forecast.toLowerCase();

        if (lowerCasedForecast.includes('sun')) 
        {
            this.#scene.overlayImage.fillColor = 0xFFFF00;
        } 
        
        else if (lowerCasedForecast.includes('cloud')) 
        {
            this.#scene.overlayImage.fillColor = 0x808080;
        } 
        
        else if (lowerCasedForecast.includes('snow')) 
        {
            this.#scene.overlayImage.fillColor = 0xFFFFFF;
        } 
        
        else if (lowerCasedForecast.includes('rain')) 
        {
            this.#scene.overlayImage.fillColor = 0x0000FF;
        }
    }
}