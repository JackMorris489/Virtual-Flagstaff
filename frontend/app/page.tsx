"use client";

import { useEffect, useRef, useState } from "react";
import PixelButton from "./components/PixelButton";
import ContactModal from "./components/ContactModal"
import SurveyModal from "./components/SurveyModal";
import AuthModal from "./components/AuthModal"
import BackgroundGraphics from "./components/BackgroundGraphics"
import { API_BASE } from "./utils/constants";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Press_Start_2P } from "next/font/google";

const pixelFont = Press_Start_2P({ subsets: ["latin"], weight: "400" });

export default function MainMenu() {
  const router = useRouter();

  // Menu SFX
  const hoverSfxRef = useRef<HTMLAudioElement | null>(null);
  const clickSfxRef = useRef<HTMLAudioElement | null>(null);
  const lastHoverAtRef = useRef<number>(0);

  useEffect(() => {
    // Preload to avoid first hover lag
    hoverSfxRef.current = new Audio("/sfx/menu-hover.wav");
    clickSfxRef.current = new Audio("/sfx/menu-click.wav");

    hoverSfxRef.current.preload = "auto";
    clickSfxRef.current.preload = "auto";

    // Adjust volume
    hoverSfxRef.current.volume = 0.35;
    clickSfxRef.current.volume = 0.35;

    return () => {
      hoverSfxRef.current = null;
      clickSfxRef.current = null;
    };
  }, []);

  const playSfx = async (a: HTMLAudioElement | null) => {
    if (!a) return;
    try {
      a.currentTime = 0;
      await a.play();
    } catch {
     
    }
  };

  const menuHover = () => {
    const now = Date.now();
    if (now - lastHoverAtRef.current < 80) return; // throttle hover spam
    lastHoverAtRef.current = now;
    void playSfx(hoverSfxRef.current);
  };

  const menuClick = () => {
    void playSfx(clickSfxRef.current);
  };

  // Combined auth modal state
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signup" | "login">("signup");

  // Weather state
  const [weather, setWeather] = useState<{ forecast: string; temperature: number } | null>(null);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);

  // Contact modal state (kept separate)
  const [contactOpen, setContactOpen] = useState(false);
  
  // Survey state
  const [surveyOpen, setSurveyOpen] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [surveyCompleted, setSurveyCompleted] = useState(false);

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

    // Disable start shortcut while any modal is open
    useEffect(() => {
      if (authOpen || contactOpen || surveyOpen) return;

      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") {
          router.push("/virtualflagstaffexperience");
        }
      };

      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }, [authOpen, contactOpen, surveyOpen, router]);

  return (
    <main
      className={`${pixelFont.className} relative min-h-screen overflow-hidden bg-black text-white`}
    >
      {/* BACKGROUND: Virtual Flagstaff skyline */}
      <BackgroundGraphics/>

      {/* content */}
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
            onMouseEnter={menuHover}
            onPointerEnter={menuHover}
            onFocus={menuHover}
            onClick={menuClick}
          >
            Start
          </PixelButton>

          {/* Combined Sign Up / Log In button */}
          <PixelButton
            onMouseEnter={menuHover}
            onPointerEnter={menuHover}
            onFocus={menuHover}
            onClick={() => {
              setAuthMode("signup");
              setAuthOpen(true);
              menuClick();
            }}
            ariaLabel="Open sign up or log in modal"
          >
            Sign Up / Log In
          </PixelButton>

          <PixelButton 
            onMouseEnter={menuHover}
            onPointerEnter={menuHover}
            onFocus={menuHover}
            onClick={() => {
              setSurveyOpen(true);
              menuClick();
            }}
          ariaLabel="Open survey">
            Survey
          </PixelButton>


          <PixelButton
            onMouseEnter={menuHover}
            onPointerEnter={menuHover}
            onFocus={menuHover}
            onClick={() => {
              menuClick();
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
                Flagstaff: {weather.forecast} • {weather.temperature}°F
              </p>
            )}
          </div>

        <p className="mt-10 text-[9px] text-white/50">
          © {new Date().getFullYear()} Virtual Flagstaff
        </p>
      </section>

      <SurveyModal
        surveyOpen={surveyOpen}
        setSurveyOpen={setSurveyOpen}
        userId={userId}
        setUserId={setUserId}
        surveyCompleted={surveyCompleted}
        setSurveyCompleted={setSurveyCompleted}
      />

      <AuthModal
        authOpen={authOpen}
        setAuthOpen={setAuthOpen}
        authMode={authMode}
        setAuthMode={setAuthMode}
        userId={userId}
        setUserId={setUserId}
        setSurveyOpen={setSurveyOpen}
        setSurveyCompleted={setSurveyCompleted}
      />

      <ContactModal
        contactOpen={contactOpen}
        setContactOpen={setContactOpen}
      />
    </main>
  );
}
