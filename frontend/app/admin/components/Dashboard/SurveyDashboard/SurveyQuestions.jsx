import { Fragment } from "react"
import SurveyQuestionItem from "./SurveyQuestionItem";

export default function SurveyQuestions({
    questions,
    updateSurveyQuestions
})
{
    return (
        <>
            {questions.map((q) => (
                <Fragment key={q.id}>
                    <SurveyQuestionItem 
                        question={q} 
                        updateSurveyQuestions={updateSurveyQuestions}
                    />
                </Fragment>
            ))
            }
        </>
    )
}