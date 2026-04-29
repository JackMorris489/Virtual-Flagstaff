import {useState} from "react"
import isValidPhone from "../utils/isValidPhone";
import {API_BASE} from "../utils/constants";
import PixelButton from "./PixelButton"
import { useSfx } from "../hooks";

type SignUpFormProps = {
    userId: number | null
    setUserId: React.Dispatch<React.SetStateAction<number | null>>
    setSurveyOpen: React.Dispatch<React.SetStateAction<boolean>>
    setSurveyCompleted: React.Dispatch<React.SetStateAction<boolean>>
    setAuthOpen: React.Dispatch<React.SetStateAction<boolean>>
    authEmailRef: React.RefObject<HTMLInputElement>
    showPassword: boolean,
    setShowPassword: React.Dispatch<React.SetStateAction<boolean>>
    setAuthMode: React.Dispatch<React.SetStateAction<string>>
}

export default function SignUpForm({
    userId,
    setUserId,
    setSurveyOpen,
    setSurveyCompleted,
    setAuthOpen,
    authEmailRef,
    showPassword,
    setShowPassword,
    setAuthMode,
}: SignUpFormProps )
{
    const [signupEmail, setSignupEmail] = useState("");
    const [signupPhone, setSignupPhone] = useState("");
    const [signupPassword, setSignupPassword] = useState("");
    const [signupMethod, setSignupMethod] = useState<"email" | "phone">("email");
    const [receiveNotifications, setReceiveNotifications] = useState(true);

    const [signupLoading, setSignupLoading] = useState(false);

    const {playClickSfx, playHoverSfx} = useSfx();

    const handleSubmit = async (e) => {
        e.preventDefault();

            if (signupMethod === "phone") {
            if (!isValidPhone(signupPhone)) {
                alert("Please enter a valid phone number");
                return;
            }
            }

            const identifier = signupMethod === "email" ? signupEmail : signupPhone;
            const phoneDigits = signupPhone.replace(/\D/g, "");

            setSignupLoading(true);

            try {
            const payload = {
                // backend requires username, password
                username: identifier, // simplest: use email/phone as username
                password: signupPassword,
                email: signupMethod === "email" ? signupEmail : null,
                phone_number: signupMethod === "phone" ? phoneDigits : null,
                receive_notifications: receiveNotifications,
                survey: null
            };

            const res = await fetch(`${API_BASE}/auth/sign-up`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data?.detail ?? "Sign up failed");
            }

            // Persist user id so we can show survey right after sign up
            try {
                // setUserId(data.id);
                // const idStr = String(userId);
                // window.localStorage.setItem("vf_user_id", idStr);
                // window.localStorage.setItem("vf_survey_completed", "false");
                // setUserId(idStr);
                alert(data.detail)
                setSurveyCompleted(false);
            } catch {
                // ignore
            }

            setAuthOpen(false);
            if (receiveNotifications)
            {
              setSurveyOpen(true);
            }
            } catch (err: any) {
            alert(err?.message ?? "Unknown sign up error");
            } finally {
            setSignupLoading(false);
            }
    }

    return (

        <form onSubmit={handleSubmit} className="grid gap-4">

            {/* method toggle */}
            <div className="flex items-center gap-2 text-[9px] uppercase tracking-widest">
              <span className="text-white/70">Use</span>
              <button
                type="button"
                onClick={() => {
                  playClickSfx()
                  setSignupMethod("email")
                }}
                className={`flex-1 border-[3px] px-3 py-2 ${
                  signupMethod === "email"
                    ? "border-white bg-white text-black"
                    : "border-white bg-black text-white"
                }`}
                onMouseEnter={playHoverSfx}
                onPointerEnter={playHoverSfx}
                onFocus={playHoverSfx}
              >
                Email
              </button>
              <button
                type="button"
                onClick={() => {
                  setSignupMethod("phone");
                  playClickSfx();
                }}
                className={`flex-1 border-[3px] px-3 py-2 ${
                  signupMethod === "phone"
                    ? "border-white bg-white text-black"
                    : "border-white bg-black text-white"
                }`}
                onMouseEnter={playHoverSfx}
                onPointerEnter={playHoverSfx}
                onFocus={playHoverSfx}
              >
                Phone
              </button>
            </div>

            {signupMethod === "email" ? (
              <label
                htmlFor="signup-email"
                className="grid gap-2 text-[10px] uppercase tracking-widest"
              >
                <span>Email</span>
                <input
                  id="signup-email"
                  ref={authEmailRef}
                  type="email"
                  required
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  className="rounded-none border-[3px] border-white bg-black px-3 py-2 text-xs text-white placeholder-white/50 outline-none"
                  placeholder="you@example.com"
                />
              </label>
            ) : (
              <label
                htmlFor="signup-phone"
                className="grid gap-2 text-[10px] uppercase tracking-widest"
              >
                <span>Phone</span>
                <input
                  id="signup-phone"
                  ref={authEmailRef}
                  type="tel"
                  required
                  value={signupPhone}
                  onChange={(e) => setSignupPhone(e.target.value)}
                  className="rounded-none border-[3px] border-white bg-black px-3 py-2 text-xs text-white placeholder-white/50 outline-none"
                  placeholder="(555) 123-4567"
                />
              </label>
            )}

            <label
              htmlFor="signup-password"
              className="grid gap-2 text-[10px] uppercase tracking-widest"
            >
              <span>Password</span>

              <div className="relative">
                <input
                  id="signup-password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  className="w-full rounded-none border-[3px] border-white bg-black px-3 py-2 pr-16 text-xs text-white placeholder-white/50 outline-none"
                  placeholder="••••••••"
                />

                {/* toggle button */}
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-none border-[2px] border-white px-2 py-1 text-[9px] uppercase tracking-widest"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </label>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <label htmlFor="notifications">Receive emails/texts?</label>
              <input
                type="checkbox"
                id="notifications"
                checked={receiveNotifications}
                onChange={(e) => setReceiveNotifications(e.target.checked)}
              />
            </div>

            <p className="text-[9px] text-white/60">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => setAuthMode("login")}
                className="underline"
              >
                Log in instead
              </button>
              .
            </p>

            <div className="mt-2 flex items-center gap-3">
              <PixelButton 
                type="submit" 
                ariaLabel="Submit sign up form"
                onClick={playClickSfx}
              >
                Create Account
              </PixelButton>
              <button
                type="button"
                onClick={() => {
                  playClickSfx();
                  setAuthOpen(false)
                }}
                className="rounded-none border-[3px] border-white px-3 py-2 text-[10px] uppercase tracking-widest"
                onMouseEnter={playHoverSfx}
                onPointerEnter={playHoverSfx}
                onFocus={playHoverSfx}
              >
                Cancel
              </button>
            </div>
          </form>
    )
}