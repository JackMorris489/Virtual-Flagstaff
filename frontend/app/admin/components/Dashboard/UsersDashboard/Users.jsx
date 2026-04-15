import { Fragment } from "react";
import User from "./User";

export default function Users({
    users
})
{
    return (
        <>
            {users.map(u => (
                <Fragment key={u.id}>
                    <User user={u}/>
                </Fragment>
            ))}
        </>
    )
}