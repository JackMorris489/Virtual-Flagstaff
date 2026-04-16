import { useState } from "react";
import UserSurvey from "./UserSurvey";
import apiFetch from "../../../../utils/apiFetch";

export default function User({
    user
})
{
    const [showSurvey, setShowSurvey] = useState(false)

    const deleteUser = async (id) => {
        return await apiFetch(`/users/${id}`, {method: "DELETE"});
    }

    const handleDelete = async (id) => {
        await deleteUser(id);
    }

    return (
        <>
            <p>Username: {user.username}</p>
            <p>Email: {user.email}</p>
            <p>Phone Number: {user.phone_number}</p>
            <p>Is admin?: {user.is_admin ? "True" : "False"}</p>
            <button 
                type="button"
                onClick={() => handleDelete(user.id)}
            >
                DELETE
            </button>
            {showSurvey
                ? 
                    <>
                        <button onClick={()=>{setShowSurvey(false)}}>HIDE SURVEY</button>
                        <UserSurvey survey={user.survey}/>
                    </>
                : <button onClick={()=>{setShowSurvey(true)}}>SHOW SURVEY</button>
            }
        </>
    )
}
