import PixelModal from "../PixelModal"
import PixelButton from "../PixelButton";
import {useSfx} from "../../hooks"
import {useEffect, useState} from "react";
import apiFetch from "../../utils/apiFetch";
import IncentivesList from "./IncentivesList"

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
                />
                <PixelButton
                    onClick={playClickSfx}
                    type="submit"
                >
                    Redeem
                </PixelButton>
            </form>
        </PixelModal>
    );
}