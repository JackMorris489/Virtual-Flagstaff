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

    const updateSurveyQuestions = async () => {
        const surveyQuestions = await fetchSurveyQuestions();
        setQuestions(surveyQuestions)
    };

    const initialize = updateSurveyQuestions;

    useEffect(() => {initialize()}, [])

    return (
        <>
            <h1>Survey Dashboard</h1>
            <CreateMenu updateSurveyQuestions={updateSurveyQuestions}/>
            <SurveyQuestions questions={questions}/>
        </>
    )
}