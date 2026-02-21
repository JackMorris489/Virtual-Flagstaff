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

const EMAIL = "email" as const
const PHONE = "phone" as const

type LoginMethod = typeof EMAIL | typeof PHONE

type LoginFormState = {
  email: string
  phone: string
  password: string
  method: LoginMethod
}

export default function LoginForm({
    setAuthOpen,
    authEmailRef,
    showPassword,
    setShowPassword,
    setAuthMode
}: LoginFormProps)
{
    const [loginForm, setLoginForm] = useState<LoginFormState>({
        email: "",
        phone: "",
        password: "",
        method: EMAIL
    })

    const handleEmailChange = (e) => {
        setLoginForm({
            ...loginForm,
            email: e.target.value
        })
    }

    const handlePhoneChange = (e) => {
        setLoginForm({
            ...loginForm,
            phone: e.target.value
        })
    }

    const handlePasswordChange = (e) => {
        setLoginForm({
            ...loginForm,
            password: e.target.value
        })
    }

    const handleMethodChange = (e) => {
        setLoginForm({
            ...loginForm,
            email: "",
            phone: "",
            method: e.target.value
        })
    }

    const reset = () => {
        setLoginForm({
            email: "",
            phone: "",
            password: "",
            method: EMAIL
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (loginForm.method === PHONE) {
            if (!isValidPhone(loginForm.phone)) {
                alert("Please enter a valid phone number.");
                return;
            }
        }

        const identifier = loginForm.method === EMAIL ? loginForm.email : loginForm.phone;

        const payload = { "username": identifier, "password": loginForm.password }

        try {
            const res = await fetch(`${API_BASE}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            
            const data = await res.json()

            if (!res.ok)
            {
                throw new Error( data?.detail || "Login failed" )
            }

            reset()
            alert(`Logged in with ${loginForm.method}: ${identifier}`);
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
            value={EMAIL}
            onClick={handleMethodChange}
            className={`flex-1 border-[3px] px-3 py-2 ${
                loginForm.method === EMAIL
                ? "border-white bg-white text-black"
                : "border-white bg-black text-white"
            }`}
            >
            Email
            </button>
            <button
            type="button"
            value={PHONE}
            onClick={handleMethodChange}
            className={`flex-1 border-[3px] px-3 py-2 ${
                loginForm.method === PHONE
                ? "border-white bg-white text-black"
                : "border-white bg-black text-white"
            }`}
            >
            Phone
            </button>
        </div>

        {loginForm.method === "email" ? (
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
                value={loginForm.email}
                onChange={handleEmailChange}
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
                value={loginForm.phone}
                onChange={handlePhoneChange}
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
                value={loginForm.password}
                onChange={handlePasswordChange}
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