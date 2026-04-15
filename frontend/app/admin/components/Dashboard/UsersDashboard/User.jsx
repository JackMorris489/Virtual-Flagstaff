import { useState } from "react";
import UserSurvey from "./UserSurvey";

export default function User({
    user
})
{
    const [showSurvey, setShowSurvey] = useState(false)

    return (
        <>
            <p>Username: {user.username}</p>
            <p>Email: {user.email}</p>
            <p>Phone Number: {user.phone_number}</p>
            <p>Is admin?: {user.is_admin ? "True" : "False"}</p>
            {!showSurvey && 
                <button onClick={()=>{setShowSurvey(true)}}>SHOW SURVEY</button>
            }
            {showSurvey && 
                <>
                    <button onClick={()=>{setShowSurvey(false)}}>HIDE SURVEY</button>
                    <UserSurvey survey={user.survey}/>
                </>
            }
            
        </>
    )
}
