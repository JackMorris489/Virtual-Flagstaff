import {useSfx} from "../../hooks"
import IncentivesList from "./IncentivesList";
import PixelButton from "../PixelButton";
import {useState, useEffect} from "react"
import apiFetch from "../../utils/apiFetch";

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

    const getChosenIncentives = () => {
        const chosenIncentives = []

        for (let i = 0; i < inputs.length; i++)
        {
            if (inputs[i])
            {
                chosenIncentives.push(incentives[i])
            }
        }

        return chosenIncentives
    }

    const getCost = (incent) => {
        let cost = 0;

        for (let i = 0; i < incent.length; i++)
        {
            cost += incent[i].required_points
        }

        return cost
    }

    const validateSufficientPoints = async (incentives) => {
        const cost = getCost(incentives);
        console.log(cost)
        const user = await apiFetch("/users/me", {credentials: "include"});
        const availPts = user.points;
        return cost > 0 && availPts >= cost
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        const chosenIncentives = getChosenIncentives();
        if (await validateSufficientPoints(chosenIncentives))
        {
            console.log("sufficient")
            await apiFetch(
                "/users/redeem", 
                {
                    method: "post",
                    credentials: "include",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({
                        incentives: chosenIncentives
                    })
                }
            )
        }

        else
        {
            console.log("Insufficient")
        }

        setOpen(false)
    }

    useEffect(() => {initInputs()}, [])

    return (
        <form
            onSubmit={
                (e) => handleSubmit(e)
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