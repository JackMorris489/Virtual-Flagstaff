import {useSfx} from "../../hooks"
import IncentivesList from "./IncentivesList";
import PixelButton from "../PixelButton";

export default function IncentivesForm({
    setOpen,
    incentives
})
{
    const {playClickSfx} = useSfx();

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