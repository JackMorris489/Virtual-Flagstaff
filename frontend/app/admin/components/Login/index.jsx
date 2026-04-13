import { useState } from "react"

export default function Login()
{
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")

    return (
        <form>
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