import { useState } from "react"
import apiFetch from "../../../utils/apiFetch"

export default function Login({
    setIsAdminLoggedIn,
    checkAdminLoggedIn
})
{
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")

    const login = async () => {
        try
        {
            await apiFetch("/auth/login", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                credentials: "include",
                body: JSON.stringify({
                    username: username,
                    password: password
                })
            })

            return true
        }
        catch (err)
        {
            console.error(err);
            return false
        }
    }


    const handleSubmit = async (e) => {
        e.preventDefault();
        const isLoggedIn = await login()
        checkAdminLoggedIn()
    }


    return (
        <form
            onSubmit={e => handleSubmit(e)}
        >
            <label>
                Username:
                <input 
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    required
                />
            </label>
            <br/>
            <br/>
            <label>
                Password:
                <input 
                    type="password" 
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                />
            </label>
            <br/>
            <br/>
            <button type="submit">Login</button>
        </form>
    )
}