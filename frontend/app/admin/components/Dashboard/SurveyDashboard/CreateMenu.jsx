import { useState } from "react"
import OptionsList from "./OptionsList"
import apiFetch from "../../../../utils/apiFetch"

export default function CreateMenu()
{

    const [question, setQuestion] = useState("")
    const [input, setInput] = useState("text")
    const [option, setOption] = useState("")
    const [options, setOptions] = useState([])

    const clearData = () => {
        setQuestion("");
        setInput("text");
        setOption("");
        setOptions([]);
    }

    const createSurveyQuestion = async () => {
        return await apiFetch("/survey-questions", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                question: question,
                input: input,
                options: options
            })
        });
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        try
        {
            await createSurveyQuestion();
            clearData();
        }

        catch (err)
        {

        }
    }

    return (
        <form onSubmit={e => handleSubmit(e)}>
            <label>
                Question:
                <input 
                    type="text" 
                    value={question} 
                    onChange={e => setQuestion(e.target.value)}
                />
            </label>
            <label>
                Input:
                <select 
                    value={input} 
                    onChange={e => setInput(e.target.value)}
                >
                    <option value="text">Text</option>
                    <option value="checkbox">Checkbox</option>
                    <option value="select">Select</option>
                    <option value="textarea">Textarea</option>
                </select>
            </label>
            {input === "checkbox" || input === "select"
                ? <>
                    <div>
                        <label>
                            Option:
                            <input 
                                type="text" 
                                value={option}
                                onChange={e => setOption(e.target.value)}
                            />
                        </label>
                        <button 
                            type="button"
                            onClick={() => {
                                setOptions(prev => [...prev, option]);
                                setOption("");
                            }}
                        >
                            Add
                        </button>
                    </div>
                    <OptionsList options={options}/>
                </>
                : <></>
            }
            <button type="submit">Submit</button>
        </form>
    )
}