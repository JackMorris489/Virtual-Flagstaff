import PixelModal from "../PixelModal"
import PixelButton from "../PixelButton";
import {useSfx} from "../../hooks"
import {useEffect, useState} from "react";
import apiFetch from "../../utils/apiFetch";
import IncentivesList from "./IncentivesList"
import IncentivesForm from "./IncentivesForm";

function fetchIncentives()
{
    return apiFetch("/incentives")
}

function fetchUser()
{
    return apiFetch("/users/me", {credentials: "include"})
}

export default function IncentivesModal({
    open,
    setOpen
})
{
    const [availPts, setAvailPts] = useState(null)
    const [incentives, setIncentives] = useState([])

    const {playClickSfx} = useSfx();

    useEffect(
        () => {
            fetchUser()
            .then(user => setAvailPts(user.points))
            .catch(() => setAvailPts(null))

            fetchIncentives()
            .then(i => setIncentives(i))
            .catch(() => setIncentives([]))
        },
        []
    )

    return (
        <PixelModal
            open={open}
            title="Incentives"
            onClose={
                () => {
                    playClickSfx();
                    setOpen(false);
                }
            }
        >
            {
                availPts ?
                    <p>Available Points: {availPts}</p> :
                    <p>Sign-up/login to redeem!</p>
            }
            {
                incentives.length > 0 ? 
                <IncentivesForm 
                    setOpen={setOpen}
                    incentives={incentives}
                /> :
                <p>None available. Please check again Later!</p>
            }
        </PixelModal>
    );
}