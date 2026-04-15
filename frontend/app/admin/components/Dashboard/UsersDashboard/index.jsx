import { useEffect, useState } from "react"
import apiFetch from "../../../../utils/apiFetch";
import Users from "./Users"

export default function UsersDashboard()
{
    const [users, setUsers] = useState([]);

    const fetchUsers = async () => {
        return await apiFetch("/users")
    }

    const refreshUsers = async () => {
        const u = await fetchUsers();
        setUsers(u);
    }

    const initialize = async () => {
        await refreshUsers()
    }

    useEffect(() => {initialize()}, []);

    return (
        <>
            <Users
                users={users}
            />
        </>
    )
}