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

export default function IncentivesModal({
    open,
    setOpen
})
{
    const [incentives, setIncentives] = useState([])

    const {playClickSfx} = useSfx();

    useEffect(
        () => {
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
                incentives.length > 0 ? 
                <IncentivesForm 
                    setOpen={setOpen}
                    incentives={incentives}
                /> :
                <p>None available! Please check again Later!</p>
            }
        </PixelModal>
    );
}