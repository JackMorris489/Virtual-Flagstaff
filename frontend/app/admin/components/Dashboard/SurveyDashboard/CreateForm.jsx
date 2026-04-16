import { useState } from "react"
import OptionsList from "./OptionsList"
import apiFetch from "../../../../utils/apiFetch"
import Form from "./Form"

export default function CreateForm({updateSurveyQuestions})
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
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({question, input, options})
        });
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        try
        {
            await createSurveyQuestion();
            clearData();
            updateSurveyQuestions();
        }

        catch (err)
        {

        }
    }

    return (
        <>
            <h2>Create Survey Question</h2>
            <Form
                question={question}
                setQuestion={setQuestion}
                input={input}
                setInput={setInput}
                option={option}
                setOption={setOption}
                options={options}
                setOptions={setOptions}
                onSubmit={handleSubmit}
                submitName={"SUBMIT"}
            />
        </>
    )
}