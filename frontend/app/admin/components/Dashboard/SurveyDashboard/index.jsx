import { useEffect, useState } from "react"
import apiFetch from "../../../../utils/apiFetch"
import CreateForm from "./CreateForm"

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


function QuestionEdit({
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


function QuestionRead({question, onEditClick, onDeleteClick})
{
    return (
        <>
            <td>{question.question}</td>
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
                    onClick={onEditClick}
                >
                    EDIT
                </button>
                <button 
                    type="button"
                    onClick={onDeleteClick}
                >
                    DELETE
                </button>
            </td>
        </>
    )
}


function Question({question, refreshQuestions})
{
    const [isEditing, setIsEditing] = useState(false);

    const [name, setName] = useState(question.question);
    const [input, setInput] = useState(question.input);
    const [options, setOptions] = useState(question.options);

    const refreshVariables = () => {
        setName(question.question);
        setInput(question.input);
        setOptions(question.options);
    }


    const refresh = async () => {
        await refreshQuestions();
        refreshVariables();
    }


    const deleteSurveyQuestion = async (id) => {
        return await apiFetch(`/survey-questions/${id}`, {method: "DELETE"});
    }


    const handleDelete = async () => {
        await deleteSurveyQuestion(question.id);
        refresh();
    }


    const updateSurveyQuestion = async (id) => {
        return await apiFetch(`/survey-questions/${id}`, {
            method: "PUT",
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({question: name, input, options})
        });
    }


    const handleUpdate = async () => {
        await updateSurveyQuestion(question.id);
        refresh();
        setIsEditing(false);
    }


    const handleCancel = async () => {
        refresh();
        setIsEditing(false);
    };

    
    const handleEdit = async () => {
        refresh();
        setIsEditing(true);
    }


    return (
        <>
            {isEditing
                ? <>
                    <QuestionEdit
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
                :
                <QuestionRead
                    question={question}
                    onEditClick={handleEdit}
                    onDeleteClick={handleDelete}
                />
            }
        </>
    )
}


function ExistingQuestions({
    questions,
    refreshQuestions
})
{
    return (
        <>
            {questions.map((q) => (
                <tr key={q.id}>
                    <Question 
                        question={q} 
                        refreshQuestions={refreshQuestions}
                    />
                </tr>
            ))}
        </>
    )
}


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

    const refreshQuestions = async () => {
        const surveyQuestions = await fetchSurveyQuestions();
        setQuestions(surveyQuestions);
    };

    const initialize = refreshQuestions;

    useEffect(() => {initialize()}, [])

    return (
        <>
            <CreateForm updateSurveyQuestions={refreshQuestions}/>
            <table>
                <TableHeader/>
                <tbody>
                    <ExistingQuestions 
                        questions={questions}
                        refreshQuestions={refreshQuestions}
                    />
                </tbody>
            </table>
        </>
    )
}