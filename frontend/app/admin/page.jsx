"use client";

import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import { useEffect, useState } from "react";
import apiFetch from "../utils/apiFetch";

export default function Admin()
{
    const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false)

    const checkAdminUser = async () => {
        let retVal
        try 
        {
            const user = await apiFetch("/users/me", {credentials: "include"})
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

    useEffect(() => {checkAdminLoggedIn()}, [])

    return (
        <>
            {isAdminLoggedIn 
                ? <Dashboard/>
                : <Login 
                    setIsAdminLoggedIn={setIsAdminLoggedIn}
                    checkAdminLoggedIn={checkAdminLoggedIn}
                />}
        </>
    );
}