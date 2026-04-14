import { useState } from "react";
import apiFetch from "../../../../utils/apiFetch";
import Form from "./Form";


export default function SurveyQuestionItem({question, updateSurveyQuestions})
{
    const [isEditing, setIsEditing] = useState(false);

    const [name, setName] = useState(question.question);
    const [input, setInput] = useState(question.input);
    const [option, setOption] = useState("")
    const [options, setOptions] = useState(question.options);

    const deleteSurveyQuestion = async (id) => {
        return await apiFetch(`/survey-questions/${id}`, {method: "DELETE"});
    }

    const handleDelete = async (id) => {
        await deleteSurveyQuestion(id);
        updateSurveyQuestions();
    }


    const updateSurveyQuestion = async (id) => {
        return await apiFetch(`/survey-questions/${id}`, {
            method: "PUT",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({question: name, input, options})
        });
    }


    const handleUpdate = async (id) => {
        await updateSurveyQuestion(id);
        updateSurveyQuestions();
        setIsEditing(false);
    }


    return (
        <>
            {isEditing
                ? <>
                    <Form
                        question={name}
                        setQuestion={setName}
                        input={input}
                        setInput={setInput}
                        option={option}
                        setOption={setOption}
                        options={options}
                        setOptions={setOptions}
                        onSubmit={() => handleUpdate(question.id)}
                        submitName={"UPDATE"}
                    />
                </>
                :<>
                    <p>Question: {question.question}</p>
                    <p>Input: {question.input}</p>
                    {
                        (question.input === "select" || question.input === "checkbox") &&
                        (
                            question.options.map((o, j) => (
                                <p key={j}>{o}</p>
                            )) 
                        )
                    }
                    <button 
                        type="button"
                        onClick={() => setIsEditing(true)}
                    >
                        EDIT
                    </button>
                    <button 
                        type="button"
                        onClick={() => handleDelete(question.id)}
                    >
                        DELETE
                    </button>
                </>
            }
        </>
    )
}