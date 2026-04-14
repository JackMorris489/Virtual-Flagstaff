import { useEffect, useState } from "react"
import apiFetch from "../../../../utils/apiFetch"
import SurveyQuestions from "./SurveyQuestions"
import CreateMenu from "./CreateMenu"

export default function SurveyDashboard()
{

    const [questions, setQuestions] = useState([])

    const fetchSurveyQuestions = async () => {
        return await apiFetch("/survey-questions")
    }

    const initialize = async () => {
        const surveyQuestions = await fetchSurveyQuestions();
        setQuestions(surveyQuestions)
    }

    useEffect(() => {initialize()}, [])

    return (
        <>
            <p>Survey Dashboard</p>
            <CreateMenu/>
            <SurveyQuestions questions={questions}/>
        </>
    )
}