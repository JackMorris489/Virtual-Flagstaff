"use client";

import React, { useEffect, useRef, useState } from "react";
import PixelButton from "./components/PixelButton";
import PixelModal from "./components/PixelModal";
import ContactModal from "./components/ContactModal"
import SurveyModal from "./components/SurveyModal";
import AuthModal from "./components/AuthModal"
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
      <div className="pointer-events-none absolute inset-0 opacity-100">
        {/* night sky gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_#0f172a_0,_#020617_55%,_#000000_100%)]" />

        {/* subtle pixel grid */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(#fff_1px,transparent_1px),linear-gradient(90deg,#fff_1px,transparent_1px)",
            backgroundSize: "16px 16px",
          }}
        />

        {/* scanlines */}
        <div
          className="absolute inset-0 mix-blend-overlay opacity-[0.08]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg,rgba(255,255,255,0.4)_0px,rgba(255,255,255,0.4)_1px,transparent_1px,transparent_3px)",
          }}
        />

        {/* stars */}
        <div
          className="absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%,rgba(255,255,255,0.9) 0,transparent 40px)," +
              "radial-gradient(circle at 75% 15%,rgba(255,255,255,0.8) 0,transparent 45px)," +
              "radial-gradient(circle at 60% 35%,rgba(255,255,255,0.6) 0,transparent 35px)," +
              "radial-gradient(circle at 30% 40%,rgba(255,255,255,0.5) 0,transparent 30px)",
          }}
        />

        {/* distant mountains */}
        <div
          className="absolute inset-x-[-10%] bottom-20 h-44 bg-gradient-to-t from-[#020617] via-[#0f172a] to-transparent opacity-90"
          style={{
            clipPath:
              "polygon(0% 100%, 10% 65%, 22% 72%, 35% 52%, 48% 70%, 60% 45%, 72% 68%, 84% 50%, 100% 70%, 100% 100%)",
          }}
        />

        {/* mid mountains */}
        <div
          className="absolute inset-x-[-10%] bottom-10 h-40 bg-gradient-to-t from-[#022c22] via-[#065f46] to-transparent opacity-95"
          style={{
            clipPath:
              "polygon(0% 100%, 8% 70%, 18% 78%, 30% 60%, 42% 75%, 55% 55%, 68% 72%, 80% 60%, 92% 75%, 100% 62%, 100% 100%)",
          }}
        />

        {/* tree line */}
        <div
          className="absolute inset-x-0 bottom-0 h-16 bg-[repeating-linear-gradient(-90deg,#022c22_0,#022c22_8px,#064e3b_8px,#064e3b_16px)]"
          style={{
            boxShadow: "0 -4px 0 #000000",
          }}
        />

        {/* glowing grid ground */}
        <div
          className="absolute inset-x-[-10%] bottom-[-40%] h-[60%] opacity-40"
          style={{
            backgroundImage:
              "linear-gradient(to top, rgba(34,197,94,0.5) 0, transparent 60%)," +
              "linear-gradient(#4ade80_1px,transparent_1px)," +
              "linear-gradient(90deg,#4ade80_1px,transparent_1px)",
            backgroundSize: "100% 100%, 40px 40px, 40px 40px",
            transform: "perspective(600px) rotateX(65deg)",
            transformOrigin: "top",
          }}
        />
      </div>

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

      
      {/* SURVEY MODAL (shown after sign up until completed) */}
      <SurveyModal
        surveyOpen={surveyOpen}
        setSurveyOpen={setSurveyOpen}
        userId={userId}
        setUserId={setUserId}
        surveyCompleted={surveyCompleted}
        setSurveyCompleted={setSurveyCompleted}
      />

      {/* AUTH (SIGN UP / LOG IN) MODAL */}
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

      {/* CONTACT MODAL */}
      <ContactModal
        contactOpen={contactOpen}
        setContactOpen={setContactOpen}
      />
      {/* <PixelModal
        open={contactOpen}
        title="Contact Us"
        onClose={() => setContactOpen(false)}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            // TODO: replace with real submit
            alert(`Message sent by ${firstName} ${lastName}`);
            setContactOpen(false);
          }}
          className="grid gap-4"
        >
          <div className="grid grid-cols-2 gap-3">
            <label
              htmlFor="contact-first"
              className="grid gap-2 text-[10px] uppercase tracking-widest"
            >
              <span>First Name</span>
              <input
                id="contact-first"
                ref={contactFirstRef}
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="rounded-none border-[3px] border-white bg-black px-3 py-2 text-xs text-white placeholder-white/50 outline-none"
                placeholder="First"
              />
            </label>

            <label
              htmlFor="contact-last"
              className="grid gap-2 text-[10px] uppercase tracking-widest"
            >
              <span>Last Name</span>
              <input
                id="contact-last"
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="rounded-none border-[3px] border-white bg-black px-3 py-2 text-xs text-white placeholder-white/50 outline-none"
                placeholder="Last"
              />
            </label>
          </div>

          <label
            htmlFor="contact-email"
            className="grid gap-2 text-[10px] uppercase tracking-widest"
          >
            <span>Email</span>
            <input
              id="contact-email"
              type="email"
              required
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className="rounded-none border-[3px] border-white bg-black px-3 py-2 text-xs text-white placeholder-white/50 outline-none"
              placeholder="you@example.com"
            />
          </label>

          <label
            htmlFor="contact-message"
            className="grid gap-2 text-[10px] uppercase tracking-widest"
          >
            <span>Message</span>
            <textarea
              id="contact-message"
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[8rem] rounded-none border-[3px] border-white bg-black px-3 py-2 text-xs text-white placeholder-white/50 outline-none"
              placeholder="Tell us about your move..."
            />
          </label>

          <div className="mt-2 flex items-center gap-3">
            <PixelButton type="submit" ariaLabel="Submit contact form">
              Send
            </PixelButton>
            <button
              type="button"
              onClick={() => setContactOpen(false)}
              className="rounded-none border-[3px] border-white px-3 py-2 text-[10px] uppercase tracking-widest"
            >
              Cancel
            </button>
          </div>
        </form>
      </PixelModal> */}
    </main>
  );
}
