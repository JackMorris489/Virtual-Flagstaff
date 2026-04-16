import { useState } from "react";
import UserSurvey from "./UserSurvey";
import apiFetch from "../../../../utils/apiFetch";
import Users from "./Users";

function UserStatic({user})
{
    return (
        <>
            <p>Username: {user.username}</p>
            <p>Email: {user.email ?? "None"}</p>
            <p>Phone Number: {user.phone_number ?? "None"}</p>
        </>
    )
}

function UserEdit({isAdmin, setIsAdmin, onUpdateClick})
{
    return (
        <>
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
                onClick={onUpdateClick}
            >
                UPDATE
            </button>
        </>
    )
}


function UserRead({user, onEditClick, onDeleteClick})
{
    const [showSurvey, setShowSurvey] = useState(false)

    const handleSurveyDisplay = () => {setShowSurvey(prev => !prev)}

    return (
        <>
            <p>Is admin?: {user.is_admin ? "True" : "False"}</p>
            <button 
                type="button"
                onClick={onEditClick}
            >
                EDIT
            </button>
            <button 
                type="button"
                onClick={onDeleteClick}
            >
                DELETE
            </button>
            {showSurvey
                ? 
                    <>
                        <button onClick={handleSurveyDisplay}>HIDE SURVEY</button>
                        <UserSurvey survey={user.survey}/>
                    </>
                : <button onClick={handleSurveyDisplay}>SHOW SURVEY</button>
            }
        </>
    )
}


export default function User({user, refreshUsers})
{
    const [isEditing, setIsEditing] = useState(false)
    const [isAdmin, setIsAdmin] = useState(false);

    const deleteUser = async (id) => {
        return await apiFetch(`/users/${id}`, {method: "DELETE"});
    }

    const handleUpdate = async () => {
        await apiFetch(`/users/${user.id}`, {
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

    const handleDelete = async () => {
        await deleteUser(user.id);
        refreshUsers();
    }

    const handleEdit = () => {
        setIsEditing(true); 
        setIsAdmin(user.is_admin);
    }

    return (
        <>
            <UserStatic user={user}/>
            {isEditing
                ? (
                    <UserEdit 
                        isAdmin={isAdmin}
                        setIsAdmin={setIsAdmin}
                        onUpdateClick={handleUpdate}
                    />
                )
                : (
                    <UserRead 
                        user={user} 
                        onEditClick={handleEdit}
                        onDeleteClick={handleDelete}
                    />
                )
            }
        </>
    )
}
