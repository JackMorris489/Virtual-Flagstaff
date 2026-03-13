import {API_BASE} from "./constants";

export default async function apiFetch(url: string, options={})
{
    try
    {
        const response = await fetch(`${API_BASE}${url}`, options);
        const data = await response.json();
        if (!response.ok)
        {
            throw new Error(data?.detail);
        }

        return data;
    }
    catch (error)
    {
        throw error;
    }
}