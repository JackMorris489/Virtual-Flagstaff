"use client";

import { useEffect, useState } from "react";
import ContactModal from "./components/ContactModal"
import SurveyModal from "./components/SurveyModal";
import AuthModal from "./components/AuthModal"
import BackgroundGraphics from "./components/BackgroundGraphics"
import MainMenu from "./components/MainMenu"
import { useRouter } from "next/navigation";
import { Press_Start_2P } from "next/font/google";

const pixelFont = Press_Start_2P({ subsets: ["latin"], weight: "400" });

export default function Page() {
    const router = useRouter();

    // Combined auth modal state
    const [authOpen, setAuthOpen] = useState(false);
    const [authMode, setAuthMode] = useState<"signup" | "login">("signup");

    // Contact modal state (kept separate)
    const [contactOpen, setContactOpen] = useState(false);
    
    // Survey state
    const [surveyOpen, setSurveyOpen] = useState(false);
    const [userId, setUserId] = useState<number | null>(null);
    const [surveyCompleted, setSurveyCompleted] = useState(false);

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
            <BackgroundGraphics/>

            <MainMenu
                setAuthMode={setAuthMode}
                setAuthOpen={setAuthOpen}
                setSurveyOpen={setSurveyOpen}
                setContactOpen={setContactOpen}
            />

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
