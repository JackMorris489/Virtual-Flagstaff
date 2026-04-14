import OptionsList from "./OptionsList"

export default function Form({
    question,
    setQuestion,
    input,
    setInput,
    option,
    setOption,
    options,
    setOptions,
    onSubmit,
    submitName
})
{
    return (
        <form onSubmit={e => onSubmit(e)}>
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
            {
                (input === "checkbox" || input === "select") &&
                (
                    <>
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
                        <OptionsList 
                            options={options}
                            setOptions={setOptions}
                        />
                    </>
                )
            }
            <button type="submit">{submitName}</button>
        </form>
    )
}