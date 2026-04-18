import { useState } from "react";
import apiFetch from "../../../../utils/apiFetch";
import Form from "./Form";

function SurveyQuestionEdit({
    question,
    setQuestion,
    input,
    setInput,
    options,
    setOptions,
    onUpdateClick,
    onCancelClick
})
{
    const handleOptionsChange = (changeOption, changeIdx) => {
        setOptions(prev => prev.map((option, idx) => {
            let returningOption = option;
            if (idx === changeIdx)
            {
                returningOption = changeOption;
            }
            return returningOption;
        }));
    }

    return (
        <>
            <th scope="row">
                <input 
                    type="text"
                    value={question}
                    onChange={e => setQuestion(e.target.value)}
                />
            </th>
            <td>
                <select
                    value={input}
                    onChange={e => setInput(e.target.value)}
                >
                    <option value="text">Text</option>
                    <option value="checkbox">Checkbox</option>
                    <option value="select">Select</option>
                    <option value="textarea">Textarea</option>
                </select>
            </td>
            <td>
                {options.map((o, idx) => (
                    <input
                        key={o}
                        type="text"
                        value={o}
                        onChange={(e) => handleOptionsChange(e.target.value, idx)}
                    />
                ))}
            </td>
            <td>
                <button 
                    type="button"
                    onClick={onUpdateClick}
                >
                    UPDATE
                </button>
                <button 
                    type="button"
                    onClick={onCancelClick}
                >
                    CANCEL
                </button>
            </td>
        </>
    )
}


export default function SurveyQuestionItem({question, updateSurveyQuestions})
{
    const [isEditing, setIsEditing] = useState(false);

    const [name, setName] = useState(question.question);
    const [input, setInput] = useState(question.input);
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


    const handleUpdate = async () => {
        await updateSurveyQuestion(question.id);
        updateSurveyQuestions();
        setIsEditing(false);
    }


    const handleCancel = () => {setIsEditing(false)};

    return (
        <>
            {isEditing
                ? <>
                    <SurveyQuestionEdit
                        question={name}
                        setQuestion={setName}
                        input={input}
                        setInput={setInput}
                        options={options}
                        setOptions={setOptions}
                        onUpdateClick={handleUpdate}
                        onCancelClick={handleCancel}
                    />
                </>
                :<>
                    <th scope="row">{question.question}</th>
                    <td>{question.input}</td>
                    <td>
                        {
                            (question.input === "select" || question.input === "checkbox") &&
                            (
                                question.options.map((o, j) => (
                                    <p key={j}>{o}</p>
                                )) 
                            )
                        }
                    </td>
                    <td>
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
                    </td>
                </>
            }
        </>
    )
}