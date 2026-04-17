import { useEffect, useState } from "react"
import apiFetch from "../../../../utils/apiFetch";
import Users from "./Users"

function TableHeader()
{
    return (
        <thead>
            <tr>
                <th scope="col">ID</th>
                <th scope="col">Username</th>
                <th scope="col">Email</th>
                <th scope="col">Phone Number</th>
                <th scope="col">Points</th>
                <th scope="col">Survey</th>
                <th scope="col">Receive Notifications</th>
                <th scope="col">Is Admin</th>
                <th scope="col">Actions</th>
            </tr>
        </thead>
    )
}


export default function UsersDashboard()
{
    const [users, setUsers] = useState([]);

    const fetchUsers = async () => {
        return await apiFetch("/users");
    }

    const refreshUsers = async () => {
        const u = await fetchUsers();
        setUsers(u);
    }

    const initialize = async () => {
        await refreshUsers();
    }

    useEffect(() => {initialize()}, []);

    return (
        <table>
            <TableHeader/>
            <Users
                users={users}
                refreshUsers={refreshUsers}
            />
        </table>
    )
}