"use client";

import { useEffect, useState } from "react";
import ContactModal from "./components/ContactModal"
import SurveyModal from "./components/SurveyModal";
import AuthModal from "./components/AuthModal"
import BackgroundGraphics from "./components/BackgroundGraphics"
import MainMenu from "./components/MainMenu"
import { useRouter } from "next/navigation";
import { Press_Start_2P } from "next/font/google";
import IncentivesModal from "./components/IncentivesModal"
import { redirect } from "next/navigation";

const pixelFont = Press_Start_2P({ subsets: ["latin"], weight: "400" });

const KONAMI_CODE = [
    "ArrowUp",
    "ArrowUp",
    "ArrowDown",
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight",
    "ArrowLeft",
    "ArrowRight",
    "b",
    "a"
];

function useKonamiCode(callback) {
  const [input, setInput] = useState([]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;

      setInput((prev) => {
        const newInput = [...prev, key].slice(-KONAMI_CODE.length);

        if (JSON.stringify(newInput) === JSON.stringify(KONAMI_CODE)) {
          callback();
          return [];
        }

        return newInput;
      });
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [callback]);
}


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

    const [incentivesOpen, setIncentivesOpen] = useState(false);

    useKonamiCode(() => redirect("/admin"))

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
                setIncentivesOpen={setIncentivesOpen}
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

            <IncentivesModal
                open={incentivesOpen}
                setOpen={setIncentivesOpen}
            />
        </main>
    );
}
