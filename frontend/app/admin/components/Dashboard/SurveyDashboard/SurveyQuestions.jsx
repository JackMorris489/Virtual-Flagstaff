import { Fragment } from "react"
import apiFetch from "../../../../utils/apiFetch";

export default function SurveyQuestions({
    questions,
    updateSurveyQuestions
})
{

    const deleteSurveyQuestion = async (id) => {
        return await apiFetch(`/survey-questions/${id}`, {method: "DELETE"});
    }


    const handleDelete = async (id) => {
        await deleteSurveyQuestion(id);
        updateSurveyQuestions();
    }

    return (
        <>
            {questions.map((q, i) => (
                <Fragment key={i}>
                    <p>Question: {q.question}</p>
                    <p>Input: {q.input}</p>
                    {q.input === "select" || q.input === "checkbox"
                        ? q.options.map((o, j) => (
                            <p key={j}>{o}</p>
                        )) 
                        : <></>
                    }
                    <button 
                        type="button"
                        onClick={() => handleDelete(q.id)}
                    >
                        Del
                    </button>
                </Fragment>
            ))
            }
        </>
    )
}