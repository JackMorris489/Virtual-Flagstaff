import PixelModal from "./PixelModal"
import { useState, useEffect, useRef } from "react"
import SignUpForm from "./SignUpForm"
import LoginForm from "./LoginForm"
import { useSfx } from "../hooks"

type AuthModalProps = {
    authOpen: boolean
    setAuthOpen: React.Dispatch<React.SetStateAction<boolean>>
    authMode: string
    setAuthMode: React.Dispatch<React.SetStateAction<string>>
    userId: number | null
    setUserId: React.Dispatch<React.SetStateAction<number | null>>
    setSurveyOpen: React.Dispatch<React.SetStateAction<boolean>>
    setSurveyCompleted: React.Dispatch<React.SetStateAction<boolean>>
}

export default function AuthModal({
    authOpen,
    setAuthOpen,
    authMode,
    setAuthMode,
    userId,
    setUserId,
    setSurveyOpen,
    setSurveyCompleted,
}: AuthModalProps )
{
  const {playClickSfx, playHoverSfx} = useSfx()

  // Combined auth modal state
  const authEmailRef = useRef<HTMLInputElement>(null);

  // Password visibility shared for current form
  const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        setShowPassword(false);
        if (authOpen && authEmailRef.current) {
        authEmailRef.current.focus();
        }
    }, [authMode, authOpen]);

    return(
         <PixelModal
        open={authOpen}
        title={authMode === "signup" ? "Sign Up" : "Log In"}
        onClose={() => {
          playClickSfx();
          setAuthOpen(false)
        }}
      >
        {/* Toggle between Sign Up and Log In */}
        <div className="mb-4 flex gap-2 text-[10px] uppercase tracking-widest">
          <button
            type="button"
            onClick={() => {
              playClickSfx()
              setAuthMode("signup")
            }}
            onMouseEnter={playHoverSfx}
            onPointerEnter={playHoverSfx}
            onFocus={playHoverSfx}
            className={`flex-1 border-[3px] px-3 py-2 ${
              authMode === "signup"
                ? "border-white bg-white text-black"
                : "border-white bg-black text-white"
            }`}
          >
            Sign Up
          </button>
          <button
            type="button"
            onClick={() => {
              playClickSfx()
              setAuthMode("login")
            }}
            className={`flex-1 border-[3px] px-3 py-2 ${
              authMode === "login"
                ? "border-white bg-white text-black"
                : "border-white bg-black text-white"
            }`}
            onMouseEnter={playHoverSfx}
            onPointerEnter={playHoverSfx}
            onFocus={playHoverSfx}
          >
            Log In
          </button>
        </div>

        {authMode === "signup" ? (
          <SignUpForm
            userId={userId}
            setUserId={setUserId}
            setSurveyOpen={setSurveyOpen}
            setSurveyCompleted={setSurveyCompleted}
            setAuthOpen={setAuthOpen}
            authEmailRef={authEmailRef}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            setAuthMode={setAuthMode}
          />
        ) : (
          <LoginForm
            setAuthOpen={setAuthOpen}
            authEmailRef={authEmailRef}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            setAuthMode={setAuthMode}
          />
        )}
      </PixelModal>
    )
}