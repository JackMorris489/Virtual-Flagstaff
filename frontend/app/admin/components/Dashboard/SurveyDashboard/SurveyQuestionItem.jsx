import { useState } from "react";
import apiFetch from "../../../../utils/apiFetch";
import Form from "./Form";

function QuestionEditSubTable({
    options,
    newOption,
    setNewOption,
    onOptionsChange,
    onAddClick,
    onDeleteClick,
})
{
    return (
        <table>
            <thead>
                <tr>
                    <th scope="col">Option</th>
                    <th scope="col">Actions</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>
                        <input
                            type="text"
                            value={newOption}
                            onChange={e => setNewOption(e.target.value)}
                        />
                    </td>
                    <td>
                        <button
                            type="button"
                            onClick={onAddClick}
                        >
                            ADD
                        </button>
                    </td>
                </tr>
                    {options.map((o, idx) => (
                        <tr key={idx}>
                            <td>
                                <input
                                    type="text"
                                    value={o}
                                    onChange={(e) => onOptionsChange(e.target.value, idx)}
                                />
                            </td>
                            <td>
                                <button
                                    type="button"
                                    onClick={() => onDeleteClick(idx)}
                                >
                                    DELETE
                                </button>
                            </td>
                        </tr>
                    ))}
            </tbody>
        </table>
    )
}

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
    const [newOption, setNewOption] = useState("")

    const handleOptionsChange = (changeOption, changeIdx) => {
        let newOptions = [...options];
        newOptions[changeIdx] = changeOption;
        setOptions(newOptions);
    };

    const handleAdd = () => {
        setOptions(prev => [...prev, newOption]);
    }

    const handleDelete = (deleteIdx) => {
        setOptions(prev => prev.filter((_, idx) => idx !== deleteIdx));
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
                <QuestionEditSubTable
                    options={options}
                    newOption={newOption}
                    setNewOption={setNewOption}
                    onOptionsChange={handleOptionsChange}
                    onAddClick={handleAdd}
                    onDeleteClick={handleDelete}
                />
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

    const resetVariables = () => {
        setName(question.question);
        setInput(question.input);
        setOptions(question.options);
    }

    const deleteSurveyQuestion = async (id) => {
        return await apiFetch(`/survey-questions/${id}`, {method: "DELETE"});
    }

    const handleDelete = async (id) => {
        await deleteSurveyQuestion(id);
        updateSurveyQuestions();
        resetVariables();
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
        resetVariables();
        setIsEditing(false);
    }


    const handleCancel = () => {
        updateSurveyQuestions();
        resetVariables();
        setIsEditing(false);
    };

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