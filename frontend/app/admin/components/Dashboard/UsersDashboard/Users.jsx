import { Fragment } from "react";
import User from "./User";

export default function Users({users, refreshUsers})
{
    return (
        <tbody>
            {users.map(u => (
                <tr key={u.id}>
                    <User 
                        user={u}
                        refreshUsers={refreshUsers}
                    />
                </tr>
            ))}
        </tbody>
    )
}