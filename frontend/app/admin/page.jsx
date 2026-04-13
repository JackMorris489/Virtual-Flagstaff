"use client";

import Login from "./components/Login";
import { useEffect, useState } from "react";
import apiFetch from "../utils/apiFetch";

export default function Admin()
{
    const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false)
    const [adminUsername, setAdminUsername] = useState(null)

    const checkAdminUser = async () => {
        let retVal
        try 
        {
            const user = await apiFetch("/users/me", {credentials: "include"})
            setAdminUsername(user.username)
            console.log(user)
            retVal = user.is_admin
        }

        catch (err) 
        {
            console.error(err)
            retVal = false
        }
        return retVal
    }

    const checkAdminLoggedIn = async () => {
        const isAdmin = await checkAdminUser();
        setIsAdminLoggedIn(isAdmin);
    };

    useEffect(() => {
        checkAdminLoggedIn();
    }, [])

    return (
        <>
            {isAdminLoggedIn 
                ? <p>{adminUsername}</p> 
                : <Login 
                    setIsAdminLoggedIn={setIsAdminLoggedIn}
                    checkAdminLoggedIn={checkAdminLoggedIn}
                />}
        </>
    );
}