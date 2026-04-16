import { useState } from "react";
import UserSurvey from "./UserSurvey";
import apiFetch from "../../../../utils/apiFetch";

export default function User({
    user,
    refreshUsers
})
{
    const [showSurvey, setShowSurvey] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [isAdmin, setIsAdmin] = useState(false);

    const deleteUser = async (id) => {
        return await apiFetch(`/users/${id}`, {method: "DELETE"});
    }

    const handleUpdate = async (id) => {
        await apiFetch(`/users/${id}`, {
            method: "PUT",
            credentials: "include",
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                is_admin: isAdmin
            })
        })
        setIsEditing(false)
        refreshUsers();
    }

    const handleDelete = async (id) => {
        await deleteUser(id);
        refreshUsers();
    }

    return (
        <>
            {isEditing
                ?
                    <>
                        <p>Username: {user.username}</p>
                        <p>Email: {user.email}</p>
                        <p>Phone Number: {user.phone_number}</p>
                        <label>
                            Is admin?: 
                            <input 
                                type="checkbox" 
                                checked={isAdmin} 
                                onChange={() => setIsAdmin(prev => !prev)}
                            />
                        </label>
                        <button 
                            type="button"
                            onClick={() => handleUpdate(user.id)}
                        >
                            UPDATE
                        </button>
                    </>
                :
                    <>
                        <p>Username: {user.username}</p>
                        <p>Email: {user.email}</p>
                        <p>Phone Number: {user.phone_number}</p>
                        <p>Is admin?: {user.is_admin ? "True" : "False"}</p>
                        <button 
                            type="button"
                            onClick={() => {
                                setIsEditing(true); 
                                setIsAdmin(user.is_admin);
                            }}
                        >
                            EDIT
                        </button>
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
            }
        </>
    )
}
