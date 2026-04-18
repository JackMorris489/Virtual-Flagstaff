
import SurveyQuestionItem from "./SurveyQuestionItem";

export default function SurveyQuestions({
    questions,
    updateSurveyQuestions
})
{
    return (
        <tbody>
            {questions.map((q) => (
                <tr key={q.id}>
                    <SurveyQuestionItem 
                        question={q} 
                        updateSurveyQuestions={updateSurveyQuestions}
                    />
                </tr>
            ))}
        </tbody>
    )
}