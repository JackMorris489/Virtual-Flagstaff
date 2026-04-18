import { useEffect, useState } from "react"
import apiFetch from "../../../../utils/apiFetch"
import SurveyQuestions from "./SurveyQuestions"
import CreateForm from "./CreateForm"

function TableHeader()
{
    return (
        <thead>
            <tr>
                <th scope="col">Question</th>
                <th scope="col">Input</th>
                <th scope="col">Options</th>
                <th scope="col">Actions</th>
            </tr>
        </thead>
    )
}

export default function SurveyDashboard()
{
    const [questions, setQuestions] = useState([])

    const fetchSurveyQuestions = async () => {
        return await apiFetch("/survey-questions")
    }

    const updateSurveyQuestions = async () => {
        const surveyQuestions = await fetchSurveyQuestions();
        setQuestions(surveyQuestions);
    };

    const initialize = updateSurveyQuestions;

    useEffect(() => {initialize()}, [])

    return (
        <>
            <CreateForm updateSurveyQuestions={updateSurveyQuestions}/>
            <table>
                <TableHeader/>
                <SurveyQuestions 
                    questions={questions}
                    updateSurveyQuestions={updateSurveyQuestions}
                />
            </table>
        </>
    )
}