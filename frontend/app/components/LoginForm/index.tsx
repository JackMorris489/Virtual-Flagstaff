import {useState} from "react"
import PixelButton from "../PixelButton"
import {API_BASE} from "../../utils/constants";

type LoginFormProps = {
    setAuthOpen: React.Dispatch<React.SetStateAction<boolean>>
    authEmailRef: React.RefObject<HTMLInputElement>
    showPassword: boolean,
    setShowPassword: React.Dispatch<React.SetStateAction<boolean>>
    setAuthMode: React.Dispatch<React.SetStateAction<string>>
}

type LoginFormState = {
    identifier: string
    password: string
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
        identifier: "",
        password: ""
    })

    const reset = () => {
        setLoginForm({
            identifier: "",
            password: ""
        })
    }

    const handleIdentifierChange = (e) => {
        setLoginForm({
            ...loginForm,
            identifier: e.target.value
        })
    }

    const handlePasswordChange = (e) => {
        setLoginForm({
            ...loginForm,
            password: e.target.value
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = { 
            "username": loginForm.identifier, 
            "password": loginForm.password
        }

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
            alert(`Logged in as ${loginForm.identifier}`);
            setAuthOpen(false);
        }
        catch
        {
            alert( "Incorrect credentials" );
        }
        
    }

    return (
        <form onSubmit={handleSubmit} className="grid gap-4">
            <label
                htmlFor="identifier"
                className="grid gap-2 text-[10px] uppercase tracking-widest"
            >
                <span>Username, email, or phone number</span>
                <input
                    id="identifier"
                    ref={authEmailRef}
                    type="text"
                    required
                    value={loginForm.identifier}
                    onChange={handleIdentifierChange}
                    className="rounded-none border-[3px] border-white bg-black px-3 py-2 text-xs text-white placeholder-white/50 outline-none"
                    placeholder=""
                />
            </label>
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