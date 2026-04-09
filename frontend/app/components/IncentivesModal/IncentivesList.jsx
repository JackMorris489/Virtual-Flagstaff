import {useState, useEffect} from "react"

export default function IncentivesList({incentives})
{
    const [inputs, setInputs] = useState([])

    const onChange = (idx) => {
        const newInputs = inputs.map(
            (input, i) => {
                return i === idx ? !input : input
            }
        );
        setInputs(newInputs)
    }

    const initInputs = () => {
        const inputs = incentives.map(
            (i) => {
                return false;
            }
        )
        setInputs(inputs)
    }

    useEffect(
        () =>  {initInputs()},
        []
    )

    return (
        <>
            {incentives.map(
                (incentive, idx) => (
                    <label key={idx}>
                        <input
                            type="checkbox"
                            checked={inputs[idx] ?? false}
                            onChange={() => onChange(idx)}
                        />
                        {incentive}
                    </label>
                )
            )}
        </>
    )
}