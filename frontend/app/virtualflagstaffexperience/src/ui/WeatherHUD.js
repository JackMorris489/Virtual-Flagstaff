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
            console.log(shortForecast)
            this.#text.setText(
                `${shortForecast}  ${temperature}°${temperatureUnit}`
            );

            this.handleOverlaySelection(shortForecast);

        } 
        
        catch (err)
        {
            this.#text.setText("Weather unavailable");
        }
    }


    async getWeather() {
        return await apiFetch("/weather");
    }

    handleOverlaySelection(forecast)
    {
        const lowerCasedForecast = forecast.toLowerCase();

        const YELLOW = 0xFFFF00;
        const GREY = 0x808080;
        const WHITE = 0xFFFFFF;
        const BLUE = 0x0000FF;
        
        let overlayColor = undefined;

        if (lowerCasedForecast.includes('sun')) 
        {
            overlayColor = YELLOW;
        } 
        
        else if (lowerCasedForecast.includes('cloud')) 
        {
            overlayColor = GREY;
        } 
        
        else if (lowerCasedForecast.includes('snow')) 
        {
            overlayColor = WHITE;
        } 
        
        else if (lowerCasedForecast.includes('rain')) 
        {
            overlayColor = BLUE;
        }

        if (overlayColor)
        {
            this.#scene.worldscene.overlayImage.fillColor = overlayColor;
        }
    }
}