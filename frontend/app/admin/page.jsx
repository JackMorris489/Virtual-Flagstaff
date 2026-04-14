"use client";

import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import { useEffect, useState } from "react";
import apiFetch from "../utils/apiFetch";

export default function Admin()
{
    const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false)

    const checkAdminUser = async () => {
        let isAdmin;
        try 
        {
            const user = await apiFetch("/users/me", {credentials: "include"});
            isAdmin = user.is_admin;
        }

        catch (err) 
        {
            isAdmin = false;
        }

        return isAdmin
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