import { Fragment } from "react";
import User from "./User";

export default function Users({
    users,
    refreshUsers
})
{
    return (
        <>
            {users.map(u => (
                <Fragment key={u.id}>
                    <User 
                        user={u}
                        refreshUsers={refreshUsers}
                    />
                </Fragment>
            ))}
        </>
    )
}