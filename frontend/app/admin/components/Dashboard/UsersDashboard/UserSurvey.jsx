import {useState, useEffect, Fragment} from "react"

export default function UserSurvey({survey})
{
    const [questions, setQuestions] = useState([])
    
    const initialize = () => {
        console.log(survey)
        if (survey)
        {
            setQuestions(Object.keys(survey))
        }
    }

    useEffect(() => {initialize()}, [])

    return (
        <>
            <p>Survey:</p>
            {questions.map((q) => {
                const answer = survey[q];

                return (
                    <Fragment key={q}>
                        <p>Question: {q}</p>

                        {Array.isArray(answer) ? (
                            answer.length > 0 ? (
                                answer.map((a) => <p key={a}>- {a}</p>)
                            ) : (
                                <p>Answer: None</p>
                            )
                        ) : (
                            <p>Answer: {answer || "None"}</p>
                        )}
                    </Fragment>
                );
            })}
        </>
    )
}