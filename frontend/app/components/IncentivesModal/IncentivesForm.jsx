import {useSfx} from "../../hooks"
import IncentivesList from "./IncentivesList";
import PixelButton from "../PixelButton";
import {useState, useEffect} from "react"

export default function IncentivesForm({
    setOpen,
    incentives
})
{
    const {playClickSfx} = useSfx();

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
        const inputs = incentives.map(() => false)
        setInputs(inputs)
    }

    useEffect(
        () =>  {initInputs()},
        []
    )

    return (
        <form
            onSubmit={
                (e) => {
                    e.preventDefault();
                    setOpen(false);
                }
            }
            className="grid gap-4"
        >
            <IncentivesList
                incentives={incentives}
                inputs={inputs}
                onChange={onChange}
            />
            <PixelButton
                onClick={playClickSfx}
                type="submit"
            >
                Redeem
            </PixelButton>
        </form>
    )
}