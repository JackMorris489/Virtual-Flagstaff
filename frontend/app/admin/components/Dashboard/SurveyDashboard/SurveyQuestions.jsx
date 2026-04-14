import { Fragment } from "react"

export default function SurveyQuestions({
    questions
})
{
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
                </Fragment>
            ))
            }
        </>
    )
}