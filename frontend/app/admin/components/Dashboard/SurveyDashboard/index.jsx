import { useEffect, useState } from "react"
import apiFetch from "../../../../utils/apiFetch"


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
    const [newOption, setNewOption] = useState("");
    const [optionsDisabled, setOptionsDisabled] = useState(false);

    const handleOptionsChange = (changeOption, changeIdx) => {
        let newOptions = [...options];
        newOptions[changeIdx] = changeOption;
        setOptions(newOptions);
    };

    const handleAdd = () => {
        setOptions(prev => [...prev, newOption]);
        setNewOption("")
    }

    const handleDelete = (deleteIdx) => {
        setOptions(prev => prev.filter((_, idx) => idx !== deleteIdx));
    }

    useEffect(() => {
        const isOptionsDisabled = input === "text" || input === "textarea";
        setOptionsDisabled(isOptionsDisabled);
        if (isOptionsDisabled)
        {
            setNewOption("");
            setOptions([]);
        }
    }, [input])

    return (
        <>
            <td>
                <input 
                    type="text"
                    value={question}
                    onChange={e => setQuestion(e.target.value)}
                />
            </td>
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
                {optionsDisabled 
                    ? <p>Cannot enter options for this input type.</p>
                    : <OptionsForm
                        option={newOption}
                        setOption={setNewOption}
                        options={options}
                        onAddClick={handleAdd}
                        onOptionsChange={handleOptionsChange}
                        onDeleteClick={handleDelete}
                    />
                }
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
    const [options, setOptions] = useState(question.options ?? []);
    
    const refreshVariables = () => {
        setName(question.question);
        setInput(question.input);
        setOptions(question.options ?? []);
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


function ExistingQuestions({questions, refreshQuestions})
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


function SurveyTableHeader()
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


function OptionsTableHeader()
{
    return (
        <thead>
            <tr>
                <th scope="col">Option</th>
                <th scope="col">Actions</th>
            </tr>
        </thead>
    )
}


function OptionCreate({option, setOption, optionsDisabled, onAddClick})
{
    return (
        <>
            <td>
                <input
                    type="text"
                    value={option}
                    onChange={e => setOption(e.target.value)}
                    disabled={optionsDisabled}
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
        </>
    )
}


function OptionEdit({option, idx, onOptionsChange, onDeleteClick})
{
    return (
        <>
            <td>
                <input
                    type="text"
                    value={option}
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
        </>
    )
}


function OptionsForm({
    option,
    setOption,
    options,
    onAddClick,
    onOptionsChange,
    onDeleteClick
})
{

    return (
        <table>
            <OptionsTableHeader/>
            <tbody>
                <tr>
                    <OptionCreate
                        option={option}
                        setOption={setOption}
                        onAddClick={onAddClick}
                    />
                </tr>
                    {options.map((o, idx) => (
                        <tr key={idx}>
                            <OptionEdit
                                option={o}
                                idx={idx}
                                onOptionsChange={onOptionsChange}
                                onDeleteClick={onDeleteClick}
                            />
                        </tr>
                    ))}
            </tbody>
        </table>
    )
}


function QuestionForm({refreshQuestions})
{
    const [question, setQuestion] = useState("")
    const [input, setInput] = useState("text")
    const [option, setOption] = useState("")
    const [options, setOptions] = useState([])
    const [optionsDisabled, setOptionsDisabled] = useState(false)

    const clear = () => {
        setQuestion("");
        setInput("text")
        setOption("")
        setOptions([]);
    }

    const createQuestion = async () => {
        return await apiFetch("/survey-questions", {
            method: "POST",
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({question, input, options})
        });
    }

    const handleCreate = async () => {
        try
        {
            await createQuestion();
            refreshQuestions();
            clear();
        }
        catch (err)
        {

        }
    };

    const handleOptionsChange = (changeOption, changeIdx) => {
        let newOptions = [...options];
        newOptions[changeIdx] = changeOption;
        setOptions(newOptions);
    };

    const handleAdd = () => {
        setOptions(prev => [...prev, option]);
        setOption("")
    }

    const handleDelete = (deleteIdx) => {
        setOptions(prev => prev.filter((_, idx) => idx !== deleteIdx));
    }

    useEffect(() => {
        const isOptionsDisabled = input === "text" || input === "textarea";
        setOptionsDisabled(isOptionsDisabled);
        if (isOptionsDisabled)
        {
            setOption("");
            setOptions([]);
        }
    }, [input]);

    return (
        <tr>
            <td>
                <input 
                    type="text" 
                    value={question} 
                    onChange={e => setQuestion(e.target.value)}
                />
            </td>
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
                {optionsDisabled 
                    ? <p>Cannot enter options for this input type.</p>
                    : <OptionsForm
                        option={option}
                        setOption={setOption}
                        options={options}
                        onAddClick={handleAdd}
                        onOptionsChange={handleOptionsChange}
                        onDeleteClick={handleDelete}
                    />
                }
            </td>
            <td>
                <button
                    type="button"
                    onClick={handleCreate}
                >
                    CREATE
                </button>
            </td>
        </tr>
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
            <table>
                <SurveyTableHeader/>
                <tbody>
                    <QuestionForm refreshQuestions={refreshQuestions}/>
                    <ExistingQuestions 
                        questions={questions}
                        refreshQuestions={refreshQuestions}
                    />
                </tbody>
            </table>
        </>
    )
}