import {API_BASE} from "./constants";

interface ApiError extends Error {
  status: number
}

export default async function apiFetch(url: string, options={})
{
    try
    {
        const response = await fetch(`${API_BASE}${url}`, options);
        const data = await response.json();
        if (!response.ok)
        {
            const error = new Error(data?.detail || "Request failed") as ApiError;
            error.status = response.status;
            throw error
        }

        return data;
    }
    catch (error)
    {
        throw error;
    }
}