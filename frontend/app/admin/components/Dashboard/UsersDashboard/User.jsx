import { useState } from "react";
import UserSurvey from "./UserSurvey";
import apiFetch from "../../../../utils/apiFetch";
import Users from "./Users";

function UserStatic({user})
{
    const [showSurvey, setShowSurvey] = useState(false);
    const handleSurveyDisplay = () => {setShowSurvey(prev => !prev)}

    return (
        <>
            <th scope="row">{user.id}</th>
            <td>{user.username}</td>
            <td>{user.email ?? "None"}</td>
            <td>{user.phone_number ?? "None"}</td>
            <td>{user.points}</td>
            <td>
                {showSurvey
                        ? (
                            <>
                                <button onClick={handleSurveyDisplay}>HIDE SURVEY</button>
                                <UserSurvey survey={user.survey}/>
                            </>
                        )
                        : <button onClick={handleSurveyDisplay}>SHOW SURVEY</button>
                }
            </td>
            
        </>
    )
}

function UserEdit({
    isAdmin, 
    setIsAdmin, 
    notify,
    setNotify,
    onUpdateClick, 
    onCancelClick
})
{
    return (
        <>
            <td>
                <label>
                    <input 
                        type="checkbox" 
                        checked={notify} 
                        onChange={() => setNotify(prev => !prev)}
                    />
                </label>
            </td>
            <td>
                <label>
                    <input 
                        type="checkbox" 
                        checked={isAdmin} 
                        onChange={() => setIsAdmin(prev => !prev)}
                    />
                </label>
            </td>
            <td>
                <button 
                    type="button"
                    onClick={onUpdateClick}
                >
                    UPDATE
                </button>
                <button
                    type="button"
                    onClick={onCancelClick}
                >
                    CANCEL
                </button>
            </td>
        </>
    )
}


function UserRead({user, onEditClick, onDeleteClick})
{
    return (
        <>
            <td>{user.receive_notifications ? "True" : "False"}</td>
            <td>{user.is_admin ? "True" : "False"}</td>
            
            <td>
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
                
            </td>
        </>
    )
}


export default function User({user, refreshUsers})
{
    const [isEditing, setIsEditing] = useState(false)
    const [isAdmin, setIsAdmin] = useState(false);
    const [notify, setNotify] = useState(false);

    const deleteUser = async (id) => {
        return await apiFetch(`/users/${id}`, {method: "DELETE"});
    }

    const handleUpdate = async () => {
        await apiFetch(`/users/${user.id}`, {
            method: "PUT",
            credentials: "include",
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                is_admin: isAdmin,
                receive_notifications: notify
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

    const handleCancel = () => {
        setIsEditing(false);
        refreshUsers();
    }

    return (
        <>
            <UserStatic user={user}/>
            {isEditing
                ? (
                    <UserEdit 
                        isAdmin={isAdmin}
                        setIsAdmin={setIsAdmin}
                        notify={notify}
                        setNotify={setNotify}
                        onUpdateClick={handleUpdate}
                        onCancelClick={handleCancel}
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
