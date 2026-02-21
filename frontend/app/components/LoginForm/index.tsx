import PixelButton from "../PixelButton"
import {LoginFormProps, useLoginForm} from "./hooks"

export default function LoginForm({
    setAuthOpen,
    authEmailRef,
    showPassword,
    setShowPassword,
    setAuthMode
}: LoginFormProps)
{
    const {
        loginForm, 
        reset, 
        handleFieldChange,
        login
    } = useLoginForm()

    const handleSubmit = async (event) => {
        event.preventDefault();
        try
        {
            const data = await login();
            reset();
            alert(data.detail);
            setAuthOpen(false);
        }

        catch (error)
        {
            alert(error.message)
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
                    onChange={e => handleFieldChange("identifier", e.target.value)}
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
                        onChange={e => handleFieldChange("password", e.target.value)}
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