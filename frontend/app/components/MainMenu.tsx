import { useEffect, useRef, useState } from "react"
import { hover, motion } from "framer-motion"
import PixelButton from "./PixelButton"
import { API_BASE } from "../utils/constants";
import {useSfx} from "../hooks"

type MainMenuProps = {
    setAuthMode: React.Dispatch<React.SetStateAction<string>>
    setAuthOpen: React.Dispatch<React.SetStateAction<boolean>>
    setSurveyOpen: React.Dispatch<React.SetStateAction<boolean>>
    setContactOpen: React.Dispatch<React.SetStateAction<boolean>>
}

export default function MainMenu({
    setAuthMode,
    setAuthOpen,
    setSurveyOpen,
    setContactOpen
}: MainMenuProps )
{
    // Weather state
    const [weather, setWeather] = useState<{ shortForecast: string; temperature: number; temperatureUnit: string } | null>(null);
    const [weatherError, setWeatherError] = useState<string | null>(null);
    const [weatherLoading, setWeatherLoading] = useState(false);

    // Menu SFX
    const {playClickSfx} = useSfx();

    // Fetch weather data
    async function fetchWeather() {
        setWeatherLoading(true);
        setWeatherError(null);

        try {
            const res = await fetch(`${API_BASE}/weather`, { method: "GET" });
            const data = await res.json();

            if (!res.ok) {
            throw new Error(data?.detail ?? "Failed to fetch weather");
            }

            setWeather(data);

        } catch (err: any) {
            setWeatherError(err?.message ?? "Unknown error");
        } finally {
            setWeatherLoading(false);
        }
    }

    useEffect(() => {
        fetchWeather();
    }, []);

    return (
        <section className="relative z-10 mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-6 text-center">
            <motion.h1
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="mb-8 text-3xl leading-tight sm:text-4xl md:text-5xl"
            >
            VIRTUAL FLAGSTAFF
            </motion.h1>

            <motion.nav
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
            className="grid w-[min(22rem,90vw)] gap-5"
            aria-label="Main menu"
            >
            <PixelButton 
                href="/virtualflagstaffexperience"
                ariaLabel="Start"
                onClick={playClickSfx}
            >
                Start
            </PixelButton>

            {/* Combined Sign Up / Log In button */}
            <PixelButton
                onClick={() => {
                setAuthMode("signup");
                setAuthOpen(true);
                playClickSfx();
                }}
                ariaLabel="Open sign up or log in modal"
            >
                Sign Up / Log In
            </PixelButton>

            <PixelButton 
                onClick={() => {
                setSurveyOpen(true);
                playClickSfx();
                }}
            ariaLabel="Open survey">
                Survey
            </PixelButton>


            <PixelButton
                onClick={() => {
                playClickSfx();
                setContactOpen(true);
                }}
                ariaLabel="Open contact modal"
            >
                Contact Us
            </PixelButton>
            </motion.nav>


            <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8 text-[10px] uppercase tracking-widest text-white/70"
            >
            Press Enter to Start
            </motion.p>
            <div className="mt-6 text-[10px] uppercase tracking-widest text-white/80">
                {weatherLoading && <p>Loading Flagstaff weather...</p>}
                {weatherError && <p className="text-white/70">Weather error: {weatherError}</p>}
                {weather && (
                <p>
                    Flagstaff: {weather.shortForecast} • {weather.temperature}°{weather.temperatureUnit}
                </p>
                )}
            </div>

            <p className="mt-10 text-[9px] text-white/50">
            © {new Date().getFullYear()} Virtual Flagstaff
            </p>
        </section>
    )
}