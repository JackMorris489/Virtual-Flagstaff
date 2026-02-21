import {useState} from "react"
import PixelButton from "./PixelButton"
import isValidPhone from "../utils/isValidPhone";
import { API_BASE } from "../utils/constants";

type LoginFormProps = {
    setAuthOpen: React.Dispatch<React.SetStateAction<boolean>>
    authEmailRef: React.RefObject<HTMLInputElement>
    showPassword: boolean,
    setShowPassword: React.Dispatch<React.SetStateAction<boolean>>
    setAuthMode: React.Dispatch<React.SetStateAction<string>>
}

export default function LoginForm({
    setAuthOpen,
    authEmailRef,
    showPassword,
    setShowPassword,
    setAuthMode
}: LoginFormProps)
{
    const [loginEmail, setLoginEmail] = useState("");
    const [loginPhone, setLoginPhone] = useState("");
    const [loginPassword, setLoginPassword] = useState("");
    const [loginMethod, setLoginMethod] = useState<"email" | "phone">("email");

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (loginMethod === "phone") {
            if (!isValidPhone(loginPhone)) {
                alert( "Please enter a valid phone number.");
                return;
            }
        }

        const identifier = loginMethod === "email" ? loginEmail : loginPhone;

        const payload = { "username": identifier, "password": loginPassword }
        console.log(payload)
        try {
            const res = await fetch(`${API_BASE}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            
            const data = await res.json()
            console.log( data )

            if (!res.ok)
            {
                throw new Error( data?.detail || "Login failed" )
            }

            alert(`Logged in with ${loginMethod}: ${identifier}`);
            setAuthOpen(false);
        }
        catch
        {
            alert( "Incorrect credentials" );
        }
        
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="grid gap-4"
        >

        {/* method toggle */}
        <div className="flex items-center gap-2 text-[9px] uppercase tracking-widest">
            <span className="text-white/70">Use</span>
            <button
            type="button"
            onClick={() => setLoginMethod("email")}
            className={`flex-1 border-[3px] px-3 py-2 ${
                loginMethod === "email"
                ? "border-white bg-white text-black"
                : "border-white bg-black text-white"
            }`}
            >
            Email
            </button>
            <button
            type="button"
            onClick={() => setLoginMethod("phone")}
            className={`flex-1 border-[3px] px-3 py-2 ${
                loginMethod === "phone"
                ? "border-white bg-white text-black"
                : "border-white bg-black text-white"
            }`}
            >
            Phone
            </button>
        </div>

        {loginMethod === "email" ? (
            <label
            htmlFor="login-email"
            className="grid gap-2 text-[10px] uppercase tracking-widest"
            >
            <span>Email</span>
            <input
                id="login-email"
                ref={authEmailRef}
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="rounded-none border-[3px] border-white bg-black px-3 py-2 text-xs text-white placeholder-white/50 outline-none"
                placeholder="you@example.com"
            />
            </label>
        ) : (
            <label
            htmlFor="login-phone"
            className="grid gap-2 text-[10px] uppercase tracking-widest"
            >
            <span>Phone</span>
            <input
                id="login-phone"
                ref={authEmailRef}
                type="tel"
                required
                value={loginPhone}
                onChange={(e) => setLoginPhone(e.target.value)}
                className="rounded-none border-[3px] border-white bg-black px-3 py-2 text-xs text-white placeholder-white/50 outline-none"
                placeholder="(555) 123-4567"
            />
            </label>
        )}

        <label
            htmlFor="login-password"
            className="grid gap-2 text-[10px] uppercase tracking-widest"
        >
            <span>Password</span>

            <div className="relative">
            <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
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

        <p className="text-[9px] text-white/60">
            Need an account?{" "}
            <button
            type="button"
            onClick={() => setAuthMode("signup")}
            className="underline"
            >
            Sign up instead
            </button>
            .
        </p>

        <div className="mt-2 flex items-center gap-3">
            <PixelButton type="submit" ariaLabel="Submit log in form">
            Log In
            </PixelButton>
            <button
            type="button"
            onClick={() => setAuthOpen(false)}
            className="rounded-none border-[3px] border-white px-3 py-2 text-[10px] uppercase tracking-widest"
            >
            Cancel
            </button>
        </div>
        </form>
    )
}